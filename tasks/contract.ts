import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { formatEther } from "ethers/lib/utils";

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

task("rugpull").setDescription("get the constants of the game deployed at").setAction(rugPull);

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
