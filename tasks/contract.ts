import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { RevealSnarkInput, RevealSnarkContractCallArgs, SnarkJSProofAndSignals } from "@darkforest_eth/snarks";
import type { LocationId } from "@darkforest_eth/types";

import { task, types } from "hardhat/config";
import { formatEther } from "ethers/lib/utils";

import { buildContractCallArgs, revealSnarkWasmPath, revealSnarkZkeyPath } from "@darkforest_eth/snarks";
import { DarkForestCore__factory } from "@darkforest_eth/contracts/typechain";
import { CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import { locationIdToDecStr } from "@darkforest_eth/serde";

// @ts-ignore
import * as snarkjs from "snarkjs";

import { BROADCAST_MARKET_ADDRESS } from "../plugins/generated/contract";

task("constants").setDescription("get the constants of the game deployed at").setAction(getEndTime);

async function getEndTime({}: { address: string }, hre: HardhatRuntimeEnvironment) {
  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = BroadcastMarketFactory.attach(BROADCAST_MARKET_ADDRESS);

  const endTime = await broadcastMarket.MARKET_CLOSE_COUNTDOWN_TIMESTAMP();
  const endDate = new Date(endTime.toNumber() * 1000);
  console.log(`Market Closes at ${endDate}`);

  const constants = await broadcastMarket.getConstants();
  console.log("FEE_PERCENT", constants.FEE_PERCENT);
  console.log("CANCELLED_COUNTDOWN_BLOCKS", constants.CANCELLED_COUNTDOWN_BLOCKS.toNumber());
  console.log("REQUEST_MAXIMUM", formatEther(constants.REQUEST_MAXIMUM));
  console.log("REQUEST_MINIMUM", formatEther(constants.REQUEST_MINIMUM));
}

task("rugpull").setDescription("withdraw funds to deployer market close").setAction(rugPull);

async function rugPull({}: { address: string }, hre: HardhatRuntimeEnvironment) {
  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = BroadcastMarketFactory.attach(BROADCAST_MARKET_ADDRESS);

  const ownerAddress = broadcastMarket.owner();
  const ownerBalance = await hre.ethers.provider.getBalance(ownerAddress);

  const available = await hre.ethers.provider.getBalance(BROADCAST_MARKET_ADDRESS);
  console.log(`${formatEther(available)} in contract, ${formatEther(ownerBalance)} in owner`);

  const rugPullTx = await broadcastMarket.rugPull();
  await rugPullTx.wait();

  const ownerNewBalance = await hre.ethers.provider.getBalance(ownerAddress);
  console.log(`${formatEther(ownerNewBalance)} in owner now, ${formatEther(ownerNewBalance.sub(ownerBalance))} `);
}

task("list").setDescription("print all broadcast requests").setAction(list);

async function list({}: { address: string }, hre: HardhatRuntimeEnvironment) {
  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = BroadcastMarketFactory.attach(BROADCAST_MARKET_ADDRESS);

  const requests = await broadcastMarket.getAllRevealRequests();
  console.log(requests.length, " total requests");

  console.log("Outstanding refunds or claims (if any):");

  for (const r of requests) {
    if (!r.paid && !r.refunded) console.log(r.location, r.paid, r.refunded);
  }
}

task("generate", "generate a valid proof for an x,y pair")
  .addParam("x", "x value", undefined, types.string)
  .addParam("y", "y value", undefined, types.string)
  .setAction(generate);

async function generate({ x, y }: { x: number; y: number }, hre: HardhatRuntimeEnvironment) {
  const darkForestCore = DarkForestCore__factory.connect(CORE_CONTRACT_ADDRESS, hre.ethers.provider);
  const constants = await darkForestCore.snarkConstants();

  const input: RevealSnarkInput = {
    x: x.toString(),
    y: y.toString(),
    PLANETHASH_KEY: constants.PLANETHASH_KEY.toString(),
    SPACETYPE_KEY: constants.SPACETYPE_KEY.toString(),
    SCALE: constants.PERLIN_LENGTH_SCALE.toString(),
    xMirror: constants.PERLIN_MIRROR_X ? "1" : "0",
    yMirror: constants.PERLIN_MIRROR_Y ? "1" : "0",
  };

  const { proof, publicSignals }: SnarkJSProofAndSignals = (await snarkjs.groth16.fullProve(
    input,
    revealSnarkWasmPath,
    revealSnarkZkeyPath
  )) as SnarkJSProofAndSignals;

  const ret = buildContractCallArgs(proof, publicSignals) as RevealSnarkContractCallArgs;
  console.log(ret);

  return ret;
}

task("request:coords", "request a reveal")
  .addParam("x", "x value", undefined, types.string)
  .addParam("y", "y value", undefined, types.string)
  .setAction(requestCoords);

async function requestCoords({ x, y }: { x: number; y: number }, hre: HardhatRuntimeEnvironment) {
  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = BroadcastMarketFactory.attach(BROADCAST_MARKET_ADDRESS);

  const overrides = {
    value: hre.REQUEST_MINIMUM,
  };

  const proof: RevealSnarkContractCallArgs = await hre.run("generate", { x, y });

  const revealRequestTx = await broadcastMarket.requestReveal(...proof, overrides);
  await revealRequestTx.wait();

  await hre.run("list");
  return;
}

task("request:locationId", "request a reveal")
  .addPositionalParam("locationId", "0 padded hex value of locationDec, no 0x prefix", undefined, types.string)
  .setAction(requestLocationId);

async function requestLocationId({ locationId }: { locationId: string }, hre: HardhatRuntimeEnvironment) {
  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = BroadcastMarketFactory.attach(BROADCAST_MARKET_ADDRESS);

  const overrides = {
    value: hre.REQUEST_MINIMUM,
  };

  const locationDecString = locationIdToDecStr(locationId as LocationId);

  const revealRequestTx = await broadcastMarket.requestRevealPlanetId(locationDecString, overrides);
  await revealRequestTx.wait();

  await hre.run("list");
  return;
}
