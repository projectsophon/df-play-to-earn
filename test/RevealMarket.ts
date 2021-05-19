import * as hre from "hardhat";
import { expect } from "chai";
import { VERIFIER_LIBRARY_ADDRESS, CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import type { Signer } from "ethers";
import type { RevealMarket } from "../types";
import type { DarkForestCore } from "@darkforest_eth/contracts/typechain";
import { DarkForestCore__factory } from "@darkforest_eth/contracts/typechain";
import { validRevealProof, invalidRevealProof, garbageRevealProof, wrongUniverseRevealProof } from "./fixtures";

describe("RevealMarket", function () {
  this.timeout(100000);

  let revealMarket: RevealMarket;
  let player1: Signer;
  let darkForestCore: DarkForestCore;

  beforeEach(async function () {
    const [, , piggyBank] = await hre.ethers.getSigners();

    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: hre.ARCHIVE_RPC_URL,
            blockNumber: hre.whitelistedPlayer1.blockNumber,
          },
        },
      ],
    });

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    revealMarket = (await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ])) as RevealMarket;
    await revealMarket.deployTransaction.wait();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [hre.whitelistedPlayer1.address],
    });
    player1 = await hre.ethers.provider.getSigner(hre.whitelistedPlayer1.address);

    darkForestCore = DarkForestCore__factory.connect(CORE_CONTRACT_ADDRESS, player1);

    await piggyBank.sendTransaction({
      to: await player1.getAddress(),
      value: hre.ethers.utils.parseEther("1000"),
    });
  });

  it("Deployer should be owner after deploy", async function () {
    const [deployer] = await hre.ethers.getSigners();

    expect(await revealMarket.owner()).to.equal(deployer.address);
  });

  it("Should revert setting verifier for non owners", async function () {
    const [_, someguy] = await hre.ethers.getSigners();

    await expect(revealMarket.connect(someguy).setVerifier(VERIFIER_LIBRARY_ADDRESS)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Emits a RevealRequested given a correct RevealProof for unrevealed planet", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const create = revealMarket.requestReveal(...validRevealProof, overrides);

    const locationID = validRevealProof[3][0];
    const x = validRevealProof[3][2];
    const y = validRevealProof[3][3];

    await expect(create)
      .to.emit(revealMarket, "RevealRequested")
      .withArgs(deployer.address, locationID, x, y, overrides.value);
  });

  it("Reverts on invalid RevealProof", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const create = revealMarket.requestReveal(...invalidRevealProof, overrides);

    await expect(create).to.be.revertedWith("Invalid reveal proof");
  });

  it("Reverts on garbage RevealProof", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };
    const create = revealMarket.requestReveal(...garbageRevealProof, overrides);

    await expect(create).to.be.revertedWith("verifyRevealProof reverted");
  });

  it("Revert on valid RevealProof generated for the wrong universe", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };
    const create = revealMarket.requestReveal(...wrongUniverseRevealProof, overrides);
    await expect(create).to.be.revertedWith("bad planethash mimc key");
  });

  it("Reverts if a planet is already revealed", async function () {
    const revealPlanetReceipt = await darkForestCore.revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const create = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(create).to.be.revertedWith("Planet already revealed");
  });

  it("Revert on claimReveal if reveal has not been requested", async function () {
    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("No request at location");
  });

  it("Revert on claimReveal if planetlocation has not been revealed", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const createReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await createReceipt.wait();

    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("Planet has not been revealed");
  });

  it("Emits RevealCollected and makes payment to revealer after planet revealed has been claimed", async function () {
    const [deployer] = await hre.ethers.getSigners();
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const createReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await createReceipt.wait();

    const locationID = validRevealProof[3][0];
    const x = validRevealProof[3][2];
    const y = validRevealProof[3][3];

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const oldBalance = await player1.getBalance();
    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt)
      .to.emit(revealMarket, "RevealCollected")
      .withArgs(deployer.address, locationID, x, y, overrides.value);

    expect(await player1.getBalance()).to.eq(oldBalance.add(overrides.value));
  });

  it("Returns a single reveal request from getReveal", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const createReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await createReceipt.wait();

    const locationID = validRevealProof[3][0];
    const x = validRevealProof[3][2];
    const y = validRevealProof[3][3];

    const reveal = await revealMarket.getReveal(locationID);

    await expect(player1.getAddress()).to.eq(reveal.requester);
    expect(locationID).to.eq(reveal.location);
    expect(x).to.eq(reveal.x);
    expect(y).to.eq(reveal.y);
    expect(overrides.value).to.eq(reveal.value);
  });
});
