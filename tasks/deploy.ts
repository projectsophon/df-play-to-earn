import { task, subtask } from "hardhat/config";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import type { Contract } from "@ethersproject/contracts";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

  const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, ["Hello, world!"]);

  await revealMarket.deployTransaction.wait();

  return revealMarket;
}

subtask(TASK_NODE_SERVER_READY).setAction(deployIntoNode);

async function deployIntoNode(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  await hre.run("compile");

  await runSuper(args);

  const revealMarket = await hre.run("deploy");
  console.log(`Deployed contract at: ${revealMarket.address}`);
}
