import * as hre from "hardhat";
import { expect } from "chai";
import { VERIFIER_LIBRARY_ADDRESS, CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";

describe("RevealMarket", function () {
  it("We should be owner", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
    await revealMarket.deployTransaction.wait();

    const [deployer] = await hre.ethers.getSigners();

    expect(await revealMarket.owner()).to.equal(deployer.address);
  });

  it("Should revert setting verifier for non owners", async function () {
    const [_, someguy] = await hre.ethers.getSigners();

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
    await revealMarket.deployTransaction.wait();

    const unpriviledgedUser = revealMarket.connect(someguy);

    await expect(unpriviledgedUser.setVerifier(VERIFIER_LIBRARY_ADDRESS)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should emit on createRevealBounty", async function () {
    const [deployer] = await hre.ethers.getSigners();

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
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

  it("Should revert on invalid createRevealBounty", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
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
        "0", //changed planethashkey
        "81",
        "8192",
        "0",
        "0",
      ]
    );

    await expect(create).to.be.revertedWith("Invalid reveal proof");
  });

  it("Should revert on verifyRevealProof", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
    await revealMarket.deployTransaction.wait();

    const create = revealMarket.createRevealBounty(
      [123, 456],
      [
        [123, 456],
        [123, 456],
      ],
      [123, 456],
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );

    await expect(create).to.be.revertedWith("verifyRevealProof reverted");
  });

  it("Should revert on bad planethash mimc key", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
      VERIFIER_LIBRARY_ADDRESS,
      CORE_CONTRACT_ADDRESS,
    ]);
    await revealMarket.deployTransaction.wait();

    const create = revealMarket.createRevealBounty(
      [
        "6703488956905729376084125218020648117436752745830296413340201871641695379299",
        "629834908771566938698132313050110304759677491468037889187994429557729867084",
      ],
      [
        [
          "14834097733998709544702024260159281041904573644219636210043232054727474232797",
          "3811454030299886099328585991186623525287151230881071862756087600451823236727",
        ],
        [
          "1200657197504738360722307129169485790503628359020822690097605285215769691203",
          "17693517781944350605331998499665187800225896415888836628502373185344719017760",
        ],
      ],
      [
        "7898071447822085779554511797565168359848894776791487318562915753288696069195",
        "8744403146004166036367006231251455419225905233823456685778683057698575645534",
      ],
      [
        "1055489038200661028569388695857909186231371749064758227922792551724851607",
        "12",
        "10052",
        "19803",
        "0",
        "0",
        "8192",
        "0",
        "0",
      ]
    );
    await expect(create).to.be.revertedWith("bad planethash mimc key");
  });
});
