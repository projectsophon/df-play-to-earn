# df-play-to-earn

Dark Forest plugins to earn xdai while playing

## Develop locally on a forked mainnet

We use yarn fork and an archive xdai rpc node in order to fork mainnet into our local environment.

- `yarn` to install dependencies
- Optionally, in `hardhat.config.ts` you can add your mainnet public address to a new player object in `env.players` if you want to be forked some xdai, and adjust the `DEVELOPMENT_BLOCK_NUMBER` to a block in the game you want to fork after.
- `npx hardhat node` to start the node
- Open up the [client](https://github.com/darkforest-eth/client) and follow directions there to start a development client (which will actually connect to our forked mainnet)
- Import your mainnet burner secret and wait for the game to load in. The first load in could take 10s of minutes depending on your rpc node 😬 but the blocks are cached after that.
- Run `yarn serve` to serve the plugin to the client.
- Create a new plugin in the client and paste:

```js
import Plugin from "http://localhost:2222/RevealMarket.js";
export default Plugin;
```
