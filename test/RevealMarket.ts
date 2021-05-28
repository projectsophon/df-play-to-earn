import * as hre from "hardhat";
import { expect } from "chai";
import { CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import type { Signer } from "ethers";
import type { RevealMarket } from "../types";
import type { DarkForestCore } from "@darkforest_eth/contracts/typechain";
import { DarkForestCore__factory } from "@darkforest_eth/contracts/typechain";
import {
  validRevealProof,
  invalidRevealProof,
  garbageRevealProof,
  wrongUniverseRevealProof,
  MARKET_OPEN_FOR_HOURS,
  MARKET_CLOSE_INCREASE,
} from "./fixtures";

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
            jsonRpcUrl: hre.config.networks.hardhat.forking?.url,
            blockNumber: hre.config.networks.hardhat.forking?.blockNumber,
          },
        },
      ],
    });

    player1 = await hre.ethers.provider.getSigner(hre.players[0].address);
    darkForestCore = DarkForestCore__factory.connect(CORE_CONTRACT_ADDRESS, player1);

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");
    revealMarket = await RevealMarketFactory.deploy(
      CORE_CONTRACT_ADDRESS,
      MARKET_OPEN_FOR_HOURS,
      hre.CANCELLED_COUNTDOWN_BLOCKS,
      hre.REQUEST_MINIMUM,
      hre.REQUEST_MAXIMUM,
      hre.FEE_PERCENT
    );
    await revealMarket.deployTransaction.wait();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [hre.players[0].address],
    });

    await piggyBank.sendTransaction({
      to: await player1.getAddress(),
      value: hre.ethers.utils.parseEther("1000"),
    });
  });

  it("Deployer should be owner after deploy", async function () {
    const [deployer] = await hre.ethers.getSigners();

    expect(await revealMarket.owner()).to.equal(deployer.address);
  });

  it("Emits a RevealRequested given a correct RevealProof for unrevealed planet", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };
    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);

    const locationID = validRevealProof[3][0];

    await expect(revealRequestTx).to.emit(revealMarket, "RevealRequested").withArgs(locationID);
  });

  it("Reverts on requestReveal with Request value too high", async function () {
    const overrides = {
      value: hre.REQUEST_MAXIMUM.add(hre.ethers.BigNumber.from(1)),
    };

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);

    await expect(revealRequestTx).to.be.revertedWith("Request value too high");
  });

  it("Reverts on requestReveal with invalid RevealProof", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestTx = revealMarket.requestReveal(...invalidRevealProof, overrides);

    await expect(revealRequestTx).to.be.revertedWith("Invalid reveal proof");
  });

  it("Reverts on requestReveal with garbage RevealProof", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };
    const revealRequestTx = revealMarket.requestReveal(...garbageRevealProof, overrides);

    await expect(revealRequestTx).to.be.revertedWith("Invalid reveal proof");
  });

  it("Reverts on requestReveal with valid RevealProof generated for the wrong universe", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };
    const revealRequestTx = revealMarket.requestReveal(...wrongUniverseRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("Invalid reveal proof");
  });

  it("Reverts on requestReveal if a RevealRequest already exists for a planet", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("RevealRequest already exists");
  });

  it("Reverts on requestReveal if a planet is already revealed", async function () {
    const revealPlanetReceipt = await darkForestCore.revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("Planet already revealed");
  });

  it("Reverts on claimReveal if no RevealRequest for given location", async function () {
    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("No RevealRequest for that Planet");
  });

  it("Reverts on claimReveal if location has not been revealed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("Planet is not revealed");
  });

  it("Reverts on claimReveal if amount has already been claimed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const claimedTx = await revealMarket.claimReveal(locationID);
    await claimedTx.wait();

    const claimedReceipt = revealMarket.connect(player1).claimReveal(locationID);
    await expect(claimedReceipt).to.be.revertedWith("RevealRequest has been claimed");
  });

  it("Emits RevealCollected and makes payment to revealer after request has been claimed and cancel not completed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };
    const fee = hre.REQUEST_MINIMUM.mul(hre.FEE_PERCENT).div(100);
    const payout = hre.REQUEST_MINIMUM.sub(fee);

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelReceipt = await revealMarket.cancelReveal(locationID);
    await cancelReceipt.wait();

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const oldBalance = await player1.getBalance();
    const claimedReceipt = revealMarket.claimReveal(locationID);
    await expect(claimedReceipt).to.emit(revealMarket, "RevealCollected").withArgs(locationID);

    expect(await player1.getBalance()).to.eq(oldBalance.add(payout));
  });

  it("Reverts on rugPull when market still open", async function () {
    const revealRequestTx = revealMarket.rugPull();
    await expect(revealRequestTx).to.be.revertedWith("Marketplace is still open");
  });

  it("Reverts on rugPull when not called by owner", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    await expect(revealMarket.connect(player1).rugPull()).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Sweeps all funds with rugPull after market close", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    await hre.ethers.provider.send("evm_increaseTime", [MARKET_CLOSE_INCREASE]);
    await hre.ethers.provider.send("evm_mine", []);

    const tx = await revealMarket.rugPull();
    await expect(tx).to.changeEtherBalance(deployer, overrides.value);

    expect(await hre.ethers.provider.getBalance(revealMarket.address)).to.be.eq(hre.ethers.BigNumber.from(0));
  });

  it("Reverts on requestReveal when value too low", async function () {
    const overrides = {
      value: hre.ethers.utils.parseEther(".1"),
    };

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("Request value too low");
  });

  it("Reverts on requestReveal when market closed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    await hre.ethers.provider.send("evm_increaseTime", [MARKET_CLOSE_INCREASE]);
    await hre.ethers.provider.send("evm_mine", []);

    const revealRequestTx = revealMarket.requestReveal(...validRevealProof, overrides);
    await expect(revealRequestTx).to.be.revertedWith("Marketplace has closed");
  });

  it("Reverts on claimReveal when market closed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    await hre.ethers.provider.send("evm_increaseTime", [MARKET_CLOSE_INCREASE]);
    await hre.ethers.provider.send("evm_mine", []);

    const claimedTx = revealMarket.claimReveal(locationID);
    await expect(claimedTx).to.be.revertedWith("Marketplace has closed");
  });

  it("Reverts on claimReveal when request cancelled countdown has finished", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelReceipt = await revealMarket.cancelReveal(locationID);
    await cancelReceipt.wait();

    for (let i = 0; i <= hre.CANCELLED_COUNTDOWN_BLOCKS; i++) {
      await hre.ethers.provider.send("evm_mine", []);
    }

    const revealPlanetReceipt = await darkForestCore.connect(player1).revealLocation(...validRevealProof);
    await revealPlanetReceipt.wait();

    const claimedTx = revealMarket.connect(player1).claimReveal(locationID);
    await expect(claimedTx).to.be.revertedWith("RevealRequest was cancelled");
  });

  it("Emits RevealCancelled when cancelReveal succeeds", async function () {
    // const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelTx = await revealMarket.cancelReveal(locationID);
    await cancelTx.wait();

    await expect(cancelTx).to.emit(revealMarket, "RevealCancelled").withArgs(locationID);
  });

  it("Reverts on cancelReveal if not requester", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.connect(player1).requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelTx = revealMarket.cancelReveal(locationID);
    await expect(cancelTx).to.be.revertedWith("Sender is not requester");
  });

  it("Reverts on claimRefund when countdown not complete", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelTx = await revealMarket.cancelReveal(locationID);
    await cancelTx.wait();

    const refundTx = revealMarket.claimRefund(locationID);

    await expect(refundTx).to.be.revertedWith("Cancel countdown not complete");
  });

  it("Emits RevealRefunded when claimRefund succeeds", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };
    const fee = hre.REQUEST_MINIMUM.mul(hre.FEE_PERCENT).div(100);
    const payout = hre.REQUEST_MINIMUM.sub(fee);

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelTx = await revealMarket.cancelReveal(locationID);
    await cancelTx.wait();

    for (let i = 0; i <= hre.CANCELLED_COUNTDOWN_BLOCKS; i++) {
      await hre.ethers.provider.send("evm_mine", []);
    }

    const tx = await revealMarket.claimRefund(locationID);

    await expect(tx).to.changeEtherBalance(deployer, payout);

    await expect(tx).to.emit(revealMarket, "RevealRefunded").withArgs(locationID);

    expect(await hre.ethers.provider.getBalance(revealMarket.address)).to.be.eq(fee);
  });

  it("Reverts on claimRefund if already claimed", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const locationID = validRevealProof[3][0];

    const cancelTx = await revealMarket.cancelReveal(locationID);
    await cancelTx.wait();

    for (let i = 0; i <= hre.CANCELLED_COUNTDOWN_BLOCKS; i++) {
      await hre.ethers.provider.send("evm_mine", []);
    }

    const refundReceipt = await revealMarket.claimRefund(locationID);
    await refundReceipt.wait();

    const refundtx = revealMarket.claimRefund(locationID);
    await expect(refundtx).to.be.revertedWith("RevealRequest was refunded");
  });

  it("Returns a single RevealRequest from getRevealRequest when given a valid location", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const fee = hre.REQUEST_MINIMUM.mul(hre.FEE_PERCENT).div(100);
    const payout = hre.REQUEST_MINIMUM.sub(fee);

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
    expect(revealRequest.payout).to.eq(payout);
    expect(revealRequest.paid).to.be.false;
  });

  // todo make this 2 when we have another valid reveal proof
  it("Returns total number of all RevealRequests from getNRevealRequests", async function () {
    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const nRevealRequests = await revealMarket.getNRevealRequests();

    expect(nRevealRequests).to.eq(1);
  });

  it("Returns all RevealRequests from bulkGetRevealRequests", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const nRevealRequests = await revealMarket.getNRevealRequests();

    const revealRequests = await revealMarket.bulkGetRevealRequests(0, nRevealRequests);

    expect(revealRequests.length).to.eq(nRevealRequests);

    expect(revealRequests[0].requester).to.eq(await deployer.getAddress());
  });

  it("Returns items in a page with getRevealRequestPage", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const overrides = {
      value: hre.REQUEST_MINIMUM,
    };

    const revealRequestReceipt = await revealMarket.requestReveal(...validRevealProof, overrides);
    await revealRequestReceipt.wait();

    const nRevealRequests = await revealMarket.getNRevealRequests();

    const revealRequests = await revealMarket.getRevealRequestPage(0);

    expect(revealRequests.length).to.eq(nRevealRequests);

    expect(revealRequests[0].requester).to.eq(await deployer.getAddress());
  });

  it("Returns no items when none exist with getRevealRequestPage", async function () {
    const revealRequests = await revealMarket.getRevealRequestPage(0);

    expect(revealRequests.length).to.eq(0);
  });

  it("Reverts on getRevealRequestPage with too large of page", async function () {
    const revealRequests = revealMarket.getRevealRequestPage(1);

    await expect(revealRequests).to.be.revertedWith("Page number too high");
  });
});
