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
import * as assert from "assert";

import * as dotenv from "dotenv";
dotenv.config();
const { DEPLOYER_MNEMONIC } = process.env;

interface Player {
  address: string;
  forkFund: string;
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    players: Player[];
    outputDir: string;

    MARKET_OPEN_FOR_HOURS: number;
    CANCELLED_COUNTDOWN_BLOCKS: number;
    REQUEST_MINIMUM: BigNumber;
    REQUEST_MAXIMUM: BigNumber;
    FEE_PERCENT: number;
  }
}

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.players = [
    // the tests use players[0] who needs to be a whitelisted user
    {
      address: "0xa9fcdf168759fbe712a651323b2f98d9ae141215",
      // lets give our player some free money
      forkFund: "100",
    },
    // you could add more players here if you need to fund more players
  ];

  // Marketplace contract setup
  const oneWeekInHours = 24 * 7;
  env.MARKET_OPEN_FOR_HOURS = oneWeekInHours;
  // The timeout countdown after which the RevealRequest is successfuly cancelled
  // and users can no longer reveal AND/OR collect their reward!
  env.CANCELLED_COUNTDOWN_BLOCKS = 512;
  // The minimum allowable Reveal offer value (fee included)
  env.REQUEST_MINIMUM = utils.parseEther("1.20");
  env.REQUEST_MAXIMUM = utils.parseEther("1000000"); // anything less than max/100
  // The listing fee to the marketplace. Fee is NOT returned upon successful cancelation.
  env.FEE_PERCENT = 20;

  // Plugin setup
  env.outputDir = path.join(env.config.paths.root, "./plugins/generated/");

  // Checks
  assert.ok(env.FEE_PERCENT < 100);
});

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// The xdai config, but it isn't added to networks unless we have a DEPLOYER_MNEMONIC
const xdai = {
  url: "https://xdai.poanetwork.dev/",
  accounts: {
    mnemonic: DEPLOYER_MNEMONIC,
  },
  chainId: 100,
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Check for a DEPLOYER_MNEMONIC before we add xdai/mainnet network to the list of networks
    // Ex: If you try to deploy to xdai without DEPLOYER_MNEMONIC, you'll see this error:
    // > Error HH100: Network xdai doesn't exist
    ...(DEPLOYER_MNEMONIC ? { xdai } : undefined),
    hardhat: {
      accounts: {
        accountsBalance: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      },
      forking: {
        enabled: true,
        url: "https://xdai-archive.blockscout.com/",
        blockNumber: 16240564,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
