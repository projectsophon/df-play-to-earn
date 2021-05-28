import type { RevealMarket } from "../../types";
import type { BigNumber } from "@ethersproject/bignumber";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

import { ViewLink } from "../components/ViewLink";
import { RequestRevealView } from "./RequestRevealView";
import { FulfillRequestsView } from "./FulfillRequestsView";
import { CancelRequestView } from "./CancelRequestView";
import { RevealRequest, sortByValue, Constants, decodeRevealRequest } from "../helpers/other";

const flex = {
  display: "flex",
};

const viewWrapper = {
  height: "280px",
};

enum Views {
  CancelRequest,
  RequestReveal,
  FulfillRequests,
}

type Props = {
  contract: RevealMarket;
  requests: RevealRequest[];
  constants: Constants;
};

export function AppView({ contract, requests, constants }: Props) {
  const [activeView, setActiveView] = useState(Views.FulfillRequests);
  const [revealRequests, setRevealRequests] = useState<RevealRequest[]>(requests);

  async function onRevealRequestChange(location: BigNumber) {
    try {
      const updatedRequest = decodeRevealRequest(await contract.getRevealRequest(location));
      setRevealRequests((requests) => {
        // Remove the old one and add the new one
        const updated = requests.filter((req) => req.location !== updatedRequest.location).concat(updatedRequest);
        return sortByValue(updated);
      });
    } catch (err) {
      // TODO
      console.log(err);
    }
  }

  useEffect(() => {
    contract.on("RevealRequested", onRevealRequestChange);
    contract.on("RevealCollected", onRevealRequestChange);
    contract.on("RevealCancelled", onRevealRequestChange);
    contract.on("RevealRefunded", onRevealRequestChange);

    return () => {
      contract.off("RevealRequested", onRevealRequestChange);
      contract.off("RevealCollected", onRevealRequestChange);
      contract.off("RevealCancelled", onRevealRequestChange);
      contract.off("RevealRefunded", onRevealRequestChange);
    };
  }, []);

  const cancelRequestActive = activeView === Views.CancelRequest;
  const requestRevealActive = activeView === Views.RequestReveal;
  const fulfillRequestsActive = activeView === Views.FulfillRequests;

  function setCancelRequestActive() {
    setActiveView(Views.CancelRequest);
  }
  function setRequestRevealActive() {
    setActiveView(Views.RequestReveal);
  }
  function setFulfillRequestsActive() {
    setActiveView(Views.FulfillRequests);
  }

  return html`
    <div>
      <div style=${flex}>
        <${ViewLink} active=${fulfillRequestsActive} text="Fulfill Requests" onClick=${setFulfillRequestsActive} />
        <${ViewLink} active=${requestRevealActive} text="Request a Reveal" onClick=${setRequestRevealActive} />
        <${ViewLink} active=${cancelRequestActive} text="My Requests" onClick=${setCancelRequestActive} />
      </div>
      <div style=${viewWrapper}>
        <${RequestRevealView}
          active=${requestRevealActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
        />
        <${FulfillRequestsView} active=${fulfillRequestsActive} contract=${contract} revealRequests=${revealRequests} />
        <${CancelRequestView}
          active=${cancelRequestActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
        />
      </div>
    </div>
  `;
}
