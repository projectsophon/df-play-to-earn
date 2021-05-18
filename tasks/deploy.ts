import { task, subtask } from "hardhat/config";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import type { Contract } from "@ethersproject/contracts";
import { VERIFIER_LIBRARY_ADDRESS } from "@darkforest_eth/contracts";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

  const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [VERIFIER_LIBRARY_ADDRESS]);

  await revealMarket.deployTransaction.wait();

  return revealMarket;
}

subtask(TASK_NODE_SERVER_READY).setAction(deployIntoNode);

async function deployIntoNode(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  const { forking } = hre.config.networks.hardhat;

  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: forking?.url,
          blockNumber: forking?.blockNumber,
        },
      },
    ],
  });
  console.log(`Forked from ${forking?.url}`);

  await hre.run("compile");

  await runSuper(args);

  const revealMarket = await hre.run("deploy");
  console.log(`Deployed contract at: ${revealMarket.address}`);
}
