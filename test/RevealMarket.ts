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

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);

    const locationID = validRevealProof[3][0];
    const x = validRevealProof[3][2];
    const y = validRevealProof[3][3];

    await expect(revealRequestTx)
      .to.emit(revealMarket, "RevealRequested")
      .withArgs(deployer.address, locationID, x, y, overrides.value);
  });

  it("Reverts on invalid RevealProof", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestTx = revealMarket.requestReveal(...invalidRevealProof, overrides);

    await expect(revealRequestTx).to.be.revertedWith("Invalid reveal proof");
  });

  it("Reverts on garbage RevealProof", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };
    const revealRequestTx = revealMarket.requestReveal(...garbageRevealProof, overrides);

    await expect(revealRequestTx).to.be.revertedWith("verifyRevealProof reverted");
  });

  it("Revert on valid RevealProof generated for the wrong universe", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };
    const revealRequestTx = revealMarket.requestReveal(...wrongUniverseRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("bad planethash mimc key");
  });

  it("Reverts if a planet is already revealed", async function () {
    const revealPlanetReceipt = await darkForestCore.revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("Planet already revealed");
  });

  it("Revert on claimReveal if location was not requested", async function () {
    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("No revealRequest at location");
  });

  it("Revert on claimReveal if location has not been revealed", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("Planet is not revealed");
  });

  it("Revert on claimReveal if amount has already been claimed", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const claimedTx = await revealMarket.claimReveal(locationID);
    await claimedTx.wait();

    const claimedReceipt = revealMarket.connect(player1).claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("revealRequest has been claimed");
  });

  it("Emits RevealCollected and makes payment to revealer after request has been claimed", async function () {
    const [deployer] = await hre.ethers.getSigners();
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

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

  it("Returns a single revealRequest from getRevealRequest", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];
    const x = validRevealProof[3][2];
    const y = validRevealProof[3][3];

    const revealRequest = await revealMarket.getRevealRequest(locationID);

    expect(revealRequest.requester).to.eq(await deployer.getAddress());
    expect(revealRequest.location).to.eq(locationID);
    expect(revealRequest.x).to.eq(x);
    expect(revealRequest.y).to.eq(y);
    expect(revealRequest.value).to.eq(overrides.value);
    expect(revealRequest.paid).to.be.false;
  });

  // todo make this 2 when we have another valid reveal proof
  it("Returns number of revealRequests from getNRevealRequests", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const nRevealRequests = await revealMarket.getNRevealRequests();

    expect(nRevealRequests).to.eq(1);
  });

  it("Returns all revealRequests from bulkGetRevealRequests", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.ethers.utils.parseEther("1.0"),
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const nRevealRequests = await revealMarket.getNRevealRequests();

    const revealRequests = await revealMarket.bulkGetRevealRequests(0, nRevealRequests);

    expect(revealRequests.length).to.eq(nRevealRequests);

    expect(revealRequests[0].requester).to.eq(await deployer.getAddress());
  });
});
