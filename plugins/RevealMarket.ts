import { html, render } from "htm/preact";

import { AppView } from "./views/AppView";

import { getContract } from "./helpers/df";
import { getRevealRequests, sortByValue } from "./helpers/other";

class RevealMarketPlugin {
  container: HTMLDivElement | null;

  constructor() {
    this.container = null;
  }
  async render(container: HTMLDivElement) {
    this.container = container;

    container.style.width = "450px";

    try {
      const contract = await getContract();

      const revealRequests = await getRevealRequests(contract);
      const sortedRequests = sortByValue(revealRequests);

      render(html`<${AppView} contract=${contract} requests=${sortedRequests} />`, container);
    } catch (err) {
      // TODO: Render error
      console.log("error starting", err);
    }
  }

  destroy() {
    //@ts-expect-error
    render(null, this.container);
  }
}

export default RevealMarketPlugin;
