import type { HardhatRuntimeEnvironment } from "hardhat/types";
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
    ARCHIVE_RPC_URL: string;
    MARKET_CLOSE_COUNTDOWN_TIMESTAMP: number;
    CANCELLED_COUNTDOWN_BLOCKS: number;
  }
}

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.whitelistedPlayer1 = {
    address: "0xe0a0a42dE89C695CFfEe76C50C3Da710BB22C112",
    blockNumber: 16154883, // game created and user whitelisted and abi updated
  };
  env.ARCHIVE_RPC_URL = "https://xdai-archive.blockscout.com";

  const oneWeek = 60 * 60 * 24 * 7;
  env.MARKET_CLOSE_COUNTDOWN_TIMESTAMP = Math.floor((Date.now() + oneWeek) / 1000);
  env.CANCELLED_COUNTDOWN_BLOCKS = 256;
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
