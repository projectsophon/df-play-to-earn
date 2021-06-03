import type { Contract } from "ethers";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";
import type { DarkForestTokens } from "@darkforest_eth/contracts/typechain";

import * as path from "path";
import * as fs from "fs/promises";
import { task, subtask } from "hardhat/config";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import { CORE_CONTRACT_ADDRESS, TOKENS_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import { DarkForestTokens__factory } from "@darkforest_eth/contracts/typechain";

//@ts-ignore
import * as devServer from "./dev-server-shim.cjs";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  console.log(`deploying on ${hre.network.name} this could take a bit`);

  const BroadcastMarketFactory = await hre.ethers.getContractFactory("BroadcastMarket");
  const broadcastMarket = await BroadcastMarketFactory.deploy(
    CORE_CONTRACT_ADDRESS,
    hre.MARKET_OPEN_FOR_HOURS,
    hre.CANCELLED_COUNTDOWN_BLOCKS,
    hre.REQUEST_MINIMUM,
    hre.REQUEST_MAXIMUM,
    hre.FEE_PERCENT
  );
  await broadcastMarket.deployTransaction.wait();

  console.log(`Successfully deployed to ${broadcastMarket.address}`);

  await fs.mkdir(hre.outputDir, { recursive: true });

  const outputPath = path.join(hre.outputDir, "./contract.ts");
  const template = `export const BROADCAST_MARKET_ADDRESS = ${JSON.stringify(broadcastMarket.address)};`;

  await fs.writeFile(outputPath, template, "utf-8");

  const endTime = await broadcastMarket.MARKET_CLOSE_COUNTDOWN_TIMESTAMP();
  const endDate = new Date(endTime.toNumber() * 1000);
  console.log(`Market Closes at ${endDate}`);

  const constants = await broadcastMarket.getConstants();
  console.log("FEE_PERCENT", constants.FEE_PERCENT);
  console.log("CANCELLED_COUNTDOWN_BLOCKS", constants.CANCELLED_COUNTDOWN_BLOCKS);
  console.log("REQUEST_MAXIMUM", constants.REQUEST_MAXIMUM);
  console.log("REQUEST_MINIMUM", constants.REQUEST_MINIMUM);

  return broadcastMarket;
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

  const broadcastMarket = await hre.run("deploy");
  console.log(`Deployed contract at: ${broadcastMarket.address}`);

  const [, , piggyBank] = await hre.ethers.getSigners();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [CORE_CONTRACT_ADDRESS],
  });

  const signer = await hre.ethers.provider.getSigner(CORE_CONTRACT_ADDRESS);
  const darkForestTokens = DarkForestTokens__factory.connect(TOKENS_CONTRACT_ADDRESS, signer) as DarkForestTokens;

  for (const player of hre.players) {
    if (player.forkFund) {
      await piggyBank.sendTransaction({
        to: player.address,
        value: hre.ethers.utils.parseEther(player.forkFund),
      });
    }

    const rngId = random256Id();

    // counterfeit artifact
    const createArtifactArgs = {
      tokenId: rngId,
      discoverer: player.address,
      planetId: 1,
      rarity: 0,
      biome: 1,
      artifactType: 9,
      owner: player.address,
    };

    const createTx = await darkForestTokens.createArtifact(createArtifactArgs);
    await createTx.wait();
    console.log(`created artifactId ${rngId} for ${player.address}`);
  }

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [CORE_CONTRACT_ADDRESS],
  });

  // So blockNumber keeps incrementing
  await hre.network.provider.send("evm_setAutomine", [false]);
  await hre.network.provider.send("evm_setIntervalMining", [5000]);

  // Start up the plugin dev-server
  await devServer.start({ dir: "plugins", ext: [".ts"] });
}

function random256Id() {
  const alphabet = "0123456789ABCDEF".split("");
  let result = "0x";
  for (let i = 0; i < 256 / 4; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}
