import { task, subtask } from "hardhat/config";
import type { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments, HardhatArguments } from "hardhat/types";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import { VERIFIER_LIBRARY_ADDRESS, CORE_CONTRACT_ADDRESS } from "@darkforest_eth/contracts";
import type { Contract } from "ethers";

task("deploy").setDescription("deploy the plugin contracts").setAction(deploy);

async function deploy({}, hre: HardhatRuntimeEnvironment): Promise<Contract> {
  const RevealMarketFactory = await hre.ethers.getContractFactory("RevealMarket");

  const revealMarket = await hre.upgrades.deployProxy(RevealMarketFactory, [
    VERIFIER_LIBRARY_ADDRESS,
    CORE_CONTRACT_ADDRESS,
  ]);

  await revealMarket.deployTransaction.wait();

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
