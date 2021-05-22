import type { RevealMarket } from "../../types";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { locationIdFromDecStr } from "@darkforest_eth/serde";

import { ViewLink } from "../components/ViewLink";
import { RequestRevealView } from "./RequestRevealView";
import { FulfillRequestsView } from "./FulfillRequestsView";
import { RevealRequest, RawRevealRequest, sortByValue, decodeRevealRequest, Constants } from "../helpers/other";

const flex = {
  display: "flex",
  justifyContent: "space-between",
};

const viewWrapper = {
  height: "280px",
};

enum Views {
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

  useEffect(() => {
    function onRevealRequested(
      requester: RawRevealRequest["requester"],
      location: RawRevealRequest["location"],
      x: RawRevealRequest["x"],
      y: RawRevealRequest["y"],
      payout: RawRevealRequest["payout"]
    ) {
      const raw = { requester, location, x, y, payout, paid: false } as RawRevealRequest;
      const newRequest = decodeRevealRequest(raw);
      setRevealRequests((requests) => sortByValue(requests.concat(newRequest)));
    }

    contract.on("RevealRequested", onRevealRequested);

    return () => {
      contract.off("RevealRequested", onRevealRequested);
    };
  }, []);

  useEffect(() => {
    // TODO: Wrong types
    function onRevealCollected(
      _collector: RawRevealRequest["requester"],
      location: RawRevealRequest["location"],
      _x: RawRevealRequest["x"],
      _y: RawRevealRequest["y"],
      _value: RawRevealRequest["payout"]
    ) {
      const loc = locationIdFromDecStr(location.toString());
      // TODO: Track claimed separately for show/hide
      setRevealRequests((requests) => sortByValue(requests.filter((req) => req.location !== loc)));
    }

    contract.on("RevealCollected", onRevealCollected);

    return () => {
      contract.off("RevealCollected", onRevealCollected);
    };
  }, []);

  const requestRevealActive = activeView === Views.RequestReveal;
  const fulfillRequestsActive = activeView === Views.FulfillRequests;

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
      </div>
      <div style=${viewWrapper}>
        <${RequestRevealView}
          active=${requestRevealActive}
          contract=${contract}
          revealRequests=${revealRequests}
          constants=${constants}
        />
        <${FulfillRequestsView} active=${fulfillRequestsActive} contract=${contract} revealRequests=${revealRequests} />
      </div>
    </div>
  `;
}
