import * as hre from "hardhat";
import { expect } from "chai";

describe("RevealMarket", function () {
  it("Should return the new greeting once it's changed", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const RevealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, ["Hello, world!"]);
    await RevealMarket.deployed();

    expect(await RevealMarket.greet()).to.equal("Hello, world!");
  });

  it("We should be owner", async function () {
    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const RevealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, ["Hello, world!"]);
    await RevealMarket.deployed();

    const [deployer] = await hre.ethers.getSigners();

    expect(await RevealMarket.owner()).to.equal(deployer.address);
  });

  it("Should revert greeting for non owners", async function () {
    const [_, someguy] = await hre.ethers.getSigners();

    const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

    const RevealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, ["Hello, world!"]);
    await RevealMarket.deployed();

    const unpriviledgedGreeter = RevealMarket.connect(someguy);

    await expect(unpriviledgedGreeter.setGreeting("Hola, mundo!")).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    expect(await RevealMarket.greet()).to.equal("Hello, world!");
  });
});
