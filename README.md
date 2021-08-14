# df-play-to-earn

Dark Forest plugins to earn xDai while playing the game.

## Getting the plugin

The plugin is bundled during the website deploy and published at https://play2earn.projectsophon.com/BroadcastMarketPlugin.js

You can use the plugin from our website by creating a new plugin with the contents:

```js
export { default } from "https://play2earn.projectsophon.com/BroadcastMarketPlugin.js";
```

## Developing plugins with interop contracts

**Requirements:** Node.js 14+ & Yarn

To develop on this project, or build your own plugins that have interop contracts, you can clone this repo with:

```bash
git clone --recurse-submodules git://github.com/projectsophon/df-play-to-earn
```

That command will clone the project and the [projectsophon/hardhat-network-fork](https://github.com/projectsophon/hardhat-network-fork) submodule.

The submodule contains a cache of the Dark Forest v0.6 Round 1 contract on the xDai network at block 16240564. The cache is pre-seeded from the `0xa9fcdf168759fbe712a651323b2f98d9ae141215` address, so your mileage may vary with loading the cache.

If you need to refetch or update the cache submodule (such as after cleaning the project), you can run the command:

```bash
git submodule update --init --recursive
```

Once you've cloned the project, you need to get all the dependencies. In the project directory you'll need to run:

```bash
yarn
```

If you started playing after block 16240564 (the morning of May 25th, 2021), you'll need to change the forking `blockNumber` in `hardhat.config.ts` to a block **after** your wallet address was whitelisted in the production game, or the game will keep asking you for a whitelist key.

_Note:_ You probably want to edit the `hardhat.config.ts` to include your own player. See [Setting up a new user](#setting-up-a-new-user) for details.

Once that is done, you'll need to run our local node with a fork of xDai, so run:

```bash
yarn start
```

This does _a bunch of stuff_! It forks xDai mainnet at our given block number, fast-forwards the chain time to right now, deploys our contracts into the local testnet, drips players some fake xDai, starts mining blocks every 5 seconds, and launches a development server for our plugin code to be served from. _Whew!_

Once the local testnet is up-and-running, you'll need to clone a copy of the [Dark Forest game client](https://github.com/darkforest-eth/client) using:

```bash
git clone git://github.com/darkforest-eth/client
```

Inside that repository, you'll also need to run:

```bash
yarn
```

And, once that is done, start the client with:

```bash
yarn start:dev
```

This will start the game client that connects to our local test net running on `http://localhost:8545` but using the actual production contract addresses that we forked from xDai mainnet!

Once the game launches, you'll log in like normal, importing your private key from your primary account. The first load will probably take 10s of minutes 😭😭😭 depending on the xDai RPC node you are forking from but the blocks are cached after that.

Upon finally logging into the game, you'll be able to create a new plugin containing:

```js
export { default } from "http://localhost:2222/BroadcastMarketPlugin.js";
```

## Setting up a new user

If you want to be dripped some counterfeit xDai, add your wallet address as new player object to `env.players` inside `hardhat.config.ts`. You'll can add another object like this:

```js
{
  address: "YOUR_ADDRESS_HERE",
  forkFund: "100",
}
```

## Deploying production contracts

Create a `.env` file with your deployer mnemonic like:

```bash
DEPLOYER_MNEMONIC=dog dog dog dog dog dog dog dog dog dog dog cat
```

Adjust contract settings to taste in `extendEnvironment` of `hardhat.config.ts`

Finally run:

```bash
npx hardhat deploy --network xdai
```

## License

GPL-3.0
