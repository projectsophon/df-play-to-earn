import * as hre from "hardhat";
import { expect } from "chai";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await hre.ethers.getContractFactory("Greeter");

    const greeter = await hre.upgrades.deployProxy(Greeter, ["Hello, world!"]);
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");
  });

  it("We should be owner", async function () {
    const Greeter = await hre.ethers.getContractFactory("Greeter");

    const greeter = await hre.upgrades.deployProxy(Greeter, ["Hello, world!"]);
    await greeter.deployed();

    const [deployer] = await hre.ethers.getSigners();

    expect(await greeter.owner()).to.equal(deployer.address);
  });

  it("Should revert greeting for non owners", async function () {
    const [_, someguy] = await hre.ethers.getSigners();

    const Greeter = await hre.ethers.getContractFactory("Greeter");

    const greeter = await hre.upgrades.deployProxy(Greeter, ["Hello, world!"]);
    await greeter.deployed();

    const unpriviledgedGreeter = greeter.connect(someguy);

    await expect(unpriviledgedGreeter.setGreeting("Hola, mundo!")).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    expect(await greeter.greet()).to.equal("Hello, world!");
  });
});
