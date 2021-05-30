import type { RevealMarket } from "../../types";
import type { BigNumber } from "@ethersproject/bignumber";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

import { ViewLink } from "../components/ViewLink";
import { RequestRevealView } from "./RequestRevealView";
import { FulfillRequestsView } from "./FulfillRequestsView";
import { CancelRequestView } from "./CancelRequestView";
import { RevealRequest, sortByValue, Constants, decodeRevealRequest, StatusMessage } from "../helpers/other";
import { LocationId } from "@darkforest_eth/types";

const flex = {
  display: "flex",
};

const messageBar = {
  ...flex,
  marginTop: "8px",
};

const shownStatusMessage = {
  height: "24px",
  margin: "auto",
};

const hiddenStatusMessage = {
  ...shownStatusMessage,
  visibility: "hidden",
};

enum Views {
  CancelRequest,
  RequestReveal,
  FulfillRequests,
}

type Props = {
  contract: RevealMarket;
  requests: Map<LocationId, RevealRequest>;
  constants: Constants;
};

export function AppView({ contract, requests, constants }: Props) {
  const [activeView, setActiveView] = useState(Views.FulfillRequests);
  const [revealRequests, setRevealRequests] = useState<RevealRequest[]>(() => sortByValue(requests));
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    let handle: ReturnType<typeof setTimeout>;
    if (statusMessage?.timeout) {
      handle = setTimeout(() => setStatusMessage(null), statusMessage.timeout);
    }

    return () => {
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, [statusMessage]);

  async function onRevealRequestChange(location: BigNumber) {
    try {
      const updatedRequest = decodeRevealRequest(await contract.getRevealRequest(location));
      // Replace the old one with the new one
      requests.set(updatedRequest.location, updatedRequest);
      setRevealRequests(sortByValue(requests));
    } catch (err) {
      console.error("Error updating requests", err);
      setStatusMessage({ message: "Error fetching new request. Please reload.", color: "#FF6492" });
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
      <div>
        <${RequestRevealView}
          active=${requestRevealActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
          onStatus=${setStatusMessage}
        />
        <${FulfillRequestsView}
          active=${fulfillRequestsActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
          onStatus=${setStatusMessage}
        />
        <${CancelRequestView}
          active=${cancelRequestActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
          onStatus=${setStatusMessage}
        />
      </div>
      <div style=${messageBar}>
        <span style=${statusMessage ? { ...shownStatusMessage, color: statusMessage.color } : hiddenStatusMessage}
          >${statusMessage?.message}</span
        >
      </div>
    </div>
  `;
}
