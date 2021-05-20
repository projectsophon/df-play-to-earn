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
    PLANETHASH_KEY: number;
    SPACETYPE_KEY: number;
    BIOMEBASE_KEY: number;
    PERLIN_MIRROR_X: boolean;
    PERLIN_MIRROR_Y: boolean;
    PERLIN_LENGTH_SCALE: number;
  }
}

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.whitelistedPlayer1 = {
    address: "0xe0a0a42dE89C695CFfEe76C50C3Da710BB22C112",
    blockNumber: 16119031, // game created and user whitelisted
  };
  env.ARCHIVE_RPC_URL = "https://xdai-archive.blockscout.com";
  env.PLANETHASH_KEY = 80;
  env.SPACETYPE_KEY = 81;
  env.BIOMEBASE_KEY = 82;
  env.PERLIN_MIRROR_X = false;
  env.PERLIN_MIRROR_Y = false;
  env.PERLIN_LENGTH_SCALE = 16384;
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
