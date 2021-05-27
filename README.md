# df-play-to-earn

Dark Forest plugins to earn xdai while playing

## Develop locally on a forked mainnet

We use yarn fork and an archive xdai rpc node in order to fork mainnet into our local environment.

- `yarn` to install dependencies
- In `hardhat.config.ts` you need to change the forking blockNumber to a block AFTER your wallet address was whitelisted, or the game will keep asking you for a whitelist key. Optional, you can add your wallet address to a new player object in `env.players` if you want to be counterfeited some xdai.
- Optionally, if you'd like to use cached block data to significantly speed up your first set of tests run `git submodule update --init --recursive` to download our cached data for the shipped block number.
- `npx hardhat node` to start the node, fork, and deploy our contracts.
- Download the current [client](https://github.com/darkforest-eth/client) and follow directions there to start a development client (which will actually connect to our forked mainnet)
- Import your mainnet burner secret and wait for the game to load in. The first load in could take 10s of minutes depending on your rpc node 😬 but the blocks are cached after that.
- Run `yarn serve` to serve the plugin to the client.
- Create a new plugin in the client and paste:

```js
import Plugin from "http://localhost:2222/RevealMarket.js";
export default Plugin;
```
