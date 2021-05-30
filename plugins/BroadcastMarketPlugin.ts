import { html, render } from "htm/preact";

import { AppView } from "./views/AppView";

import { getContract } from "./helpers/df";
import { getRevealRequests, decodeConstants } from "./helpers/other";

class BroadcastMarketPlugin {
  container: HTMLDivElement | null;

  constructor() {
    this.container = null;
  }
  async render(container: HTMLDivElement) {
    this.container = container;

    container.style.width = "450px";

    try {
      const contract = await getContract();

      const constants = decodeConstants(await contract.getConstants());

      const revealRequests = await getRevealRequests(contract);

      render(html`<${AppView} contract=${contract} requests=${revealRequests} constants=${constants} />`, container);
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Error starting plugin:", err);
      render(html`<div>${err.message}</div>`, this.container);
    }
  }

  destroy() {
    //@ts-expect-error
    render(null, this.container);
  }
}

export default BroadcastMarketPlugin;
