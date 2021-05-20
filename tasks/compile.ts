import type { HardhatArguments, HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments } from "hardhat/types";
import { task } from "hardhat/config";
import * as path from "path";
import * as fs from "fs/promises";

task("compile", "hook the compile step and copy our abis after").setAction(writeAbi);

async function writeAbi(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  await runSuper(args);

  const { abi } = await hre.artifacts.readArtifact("RevealMarket");

  const outputPath = path.join(hre.config.paths.root, "./plugins/RevealMarketABI.ts");
  const template = `export default ${JSON.stringify(abi)}`;

  await fs.writeFile(outputPath, template, "utf-8");
}
