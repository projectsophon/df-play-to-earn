import { h, render } from "preact";

import { AppView } from "./views/EmpireAppView";

import { getContract } from "./helpers/df";
import { getRevealRequests, decodeConstants } from "./helpers/other";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { skipFirstPagination } from "./helpers/skip-first-pagination";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        planets: skipFirstPagination(["where", "orderBy"]),
      },
    },
  },
});

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/darkforest-eth/dark-forest-v06-round-2",
  cache,
});

class BroadcastMarketPlugin {
  container: HTMLDivElement | null;

  constructor() {
    this.container = null;
  }
  async render(container: HTMLDivElement) {
    this.container = container;

    container.style.width = "470px";

    try {
      const contract = await getContract();

      const constants = decodeConstants(await contract.getConstants());

      const revealRequests = await getRevealRequests(contract);

      render(
        <ApolloProvider client={client}>
          <AppView contract={contract} requests={revealRequests} constants={constants} />
        </ApolloProvider>,
        container
      );
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Error starting plugin:", err);
      render(<div>{err.message}</div>, this.container);
    }
  }

  destroy() {
    render(null, this.container);
  }
}

export default BroadcastMarketPlugin;
