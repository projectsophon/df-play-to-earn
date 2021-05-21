import type { BigNumber } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import * as path from "path";
import { utils } from "ethers";
import { HardhatUserConfig, extendEnvironment, task } from "hardhat/config";
import "hardhat/types/runtime";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "./tasks/deploy";
import "./tasks/compile";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    whitelistedPlayer1: {
      address: string;
      blockNumber: number;
    };
    outputDir: string;

    ARCHIVE_RPC_URL: string;
    MARKET_OPEN_FOR_HOURS: number;
    CANCELLED_COUNTDOWN_BLOCKS: number;
    PAYOUT_NUMERATOR: number; //uint8
    PAYOUT_DENOMINATOR: number; //uint8
    REQUEST_MINIMUM: BigNumber;
  }
}

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.whitelistedPlayer1 = {
    address: "0xe0a0a42dE89C695CFfEe76C50C3Da710BB22C112",
    blockNumber: 16154883, // game created and user whitelisted and abi updated
  };
  env.ARCHIVE_RPC_URL = "https://xdai-archive.blockscout.com";

  const oneWeekInHours = 24 * 7;
  env.MARKET_OPEN_FOR_HOURS = oneWeekInHours;
  env.CANCELLED_COUNTDOWN_BLOCKS = 512;
  env.PAYOUT_NUMERATOR = 9;
  env.PAYOUT_DENOMINATOR = 10;
  env.REQUEST_MINIMUM = utils.parseEther("1");

  env.outputDir = path.join(env.config.paths.root, "./plugins/generated/");
});

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
