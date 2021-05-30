import type { Contract } from "ethers";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";

import * as path from "path";
import * as fs from "fs/promises";
import { task, subtask } from "hardhat/config";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import { CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";

//@ts-ignore
import * as devServer from "./dev-server-shim.cjs";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");
  const revealMarket = await RevealMarketFactory.deploy(
    CORE_CONTRACT_ADDRESS,
    hre.MARKET_OPEN_FOR_HOURS,
    hre.CANCELLED_COUNTDOWN_BLOCKS,
    hre.REQUEST_MINIMUM,
    hre.REQUEST_MAXIMUM,
    hre.FEE_PERCENT
  );
  await revealMarket.deployTransaction.wait();

  await fs.mkdir(hre.outputDir, { recursive: true });

  const outputPath = path.join(hre.outputDir, "./contract.ts");
  const template = `export const REVEAL_MARKET_ADDRESS = ${JSON.stringify(revealMarket.address)}`;

  await fs.writeFile(outputPath, template, "utf-8");

  return revealMarket;
}

subtask(TASK_NODE_SERVER_READY).setAction(deployIntoNode);

async function deployIntoNode(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
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

  const block = await hre.ethers.provider.getBlock("latest");
  const blockTime = new Date(block.timestamp * 1000);
  const actualTime = new Date();
  //@ts-expect-error
  const timeDiffInMs = actualTime - blockTime;
  const timeDiffInSec = Math.floor(timeDiffInMs / 1000);

  // Fast forward the mockchain to be now
  await hre.ethers.provider.send("evm_increaseTime", [timeDiffInSec]);

  await hre.run("compile");

  await runSuper(args);

  const revealMarket = await hre.run("deploy");
  console.log(`Deployed contract at: ${revealMarket.address}`);

  const [, , piggyBank] = await hre.ethers.getSigners();

  for (const player of hre.players) {
    if (player.forkFund) {
      await piggyBank.sendTransaction({
        to: player.address,
        value: hre.ethers.utils.parseEther(player.forkFund),
      });
    }
  }

  // So blockNumber keeps incrementing
  await hre.network.provider.send("evm_setAutomine", [false]);
  await hre.network.provider.send("evm_setIntervalMining", [5000]);

  // Start up the plugin dev-server
  await devServer.start({ dir: "plugins", ext: [".ts"] });
}
