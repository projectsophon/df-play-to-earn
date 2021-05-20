import { task, subtask } from "hardhat/config";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";
import { DarkForestCore__factory } from "@darkforest_eth/contracts/typechain";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import { VERIFIER_LIBRARY_ADDRESS, CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import type { Contract } from "ethers";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  const [deployer] = await hre.ethers.getSigners();

  const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");
  const revealMarket = await RevealMarketFactory.deploy();
  await revealMarket.deployTransaction.wait();

  const darkForestCore = DarkForestCore__factory.connect(CORE_CONTRACT_ADDRESS, deployer);

  const { PLANETHASH_KEY, SPACETYPE_KEY, BIOMEBASE_KEY, PERLIN_MIRROR_X, PERLIN_MIRROR_Y, PERLIN_LENGTH_SCALE } =
    await darkForestCore.callStatic.snarkConstants();

  const revealReceipt = await revealMarket.initialize(
    VERIFIER_LIBRARY_ADDRESS,
    CORE_CONTRACT_ADDRESS,
    PLANETHASH_KEY,
    SPACETYPE_KEY,
    BIOMEBASE_KEY,
    PERLIN_MIRROR_X,
    PERLIN_MIRROR_Y,
    PERLIN_LENGTH_SCALE
  );
  await revealReceipt.wait();

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
          jsonRpcUrl: hre.ARCHIVE_RPC_URL,
        },
      },
    ],
  });
  console.log(`Forked from ${hre.ARCHIVE_RPC_URL}`);

  await hre.run("compile");

  await runSuper(args);

  const revealMarket = await hre.run("deploy");
  console.log(`Deployed contract at: ${revealMarket.address}`);

  const [, , piggyBank] = await hre.ethers.getSigners();
  await piggyBank.sendTransaction({
    to: hre.whitelistedPlayer1.address,
    value: hre.ethers.utils.parseEther("1000"),
  });
}
