import * as hre from "hardhat";
import { expect } from "chai";
import { VERIFIER_LIBRARY_ADDRESS } from "@darkforest_eth/contracts";

describe("RevealMarket", function () {
  it("We should be owner", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [VERIFIER_LIBRARY_ADDRESS]);
    await revealMarket.deployTransaction.wait();

    const [deployer] = await hre.ethers.getSigners();

    expect(await revealMarket.owner()).to.equal(deployer.address);
  });

  it("Should revert setting verifier for non owners", async function () {
    const [_, someguy] = await hre.ethers.getSigners();

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [VERIFIER_LIBRARY_ADDRESS]);
    await revealMarket.deployTransaction.wait();

    const unpriviledgedUser = revealMarket.connect(someguy);

    await expect(unpriviledgedUser.setVerifier(VERIFIER_LIBRARY_ADDRESS)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should emit on createRevealBounty", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [VERIFIER_LIBRARY_ADDRESS]);
    await revealMarket.deployTransaction.wait();

    const create = revealMarket.createRevealBounty(
      [
        "2314917398471075791412081768726178095305597292375298585677016379640178219521",
        "17606815012124429640284123340640628168602028037775402333286365584225354122883",
      ],
      [
        [
          "17171416336026029969038495820980125293157393377197030515615042452561000512749",
          "8163168209118465841128450620521648790689517571830842209262669719134305032532",
        ],
        [
          "2451655543117476611351833694719585851453187856289194963680113409125852058207",
          "12853130698678238156002065254862639631778086531719717435303212145041211995285",
        ],
      ],
      [
        "20160746078585995631554247363996582292846614312492703999792737691661506266392",
        "16194628047199012186267140664390778799670832821295267771757783460170129601195",
      ],
      [
        "1329179306606537017160072927171575336704451797191632288973401732155541798",
        "13",
        "21888242871839275222246405745257275088548364400416034343698204186575808477663",
        "24663",
        "80",
        "81",
        "8192",
        "0",
        "0",
      ]
    );

    await expect(create)
      .to.emit(revealMarket, "RevealBountyAnnounced")
      .withArgs(deployer.address, "1329179306606537017160072927171575336704451797191632288973401732155541798");
  });
});
