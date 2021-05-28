import type { RevealMarket } from "../../types";
import type { BigNumber } from "@ethersproject/bignumber";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { locationIdFromDecStr } from "@darkforest_eth/serde";

import { ViewLink } from "../components/ViewLink";
import { RequestRevealView } from "./RequestRevealView";
import { FulfillRequestsView } from "./FulfillRequestsView";
import { CancelRequestView } from "./CancelRequestView";
import { RevealRequest, RawRevealRequest, sortByValue, Constants, revealRequestFromEvent } from "../helpers/other";

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

  useEffect(() => {
    function onRevealRequested(
      requester: RawRevealRequest["requester"],
      location: RawRevealRequest["location"],
      x: RawRevealRequest["x"],
      y: RawRevealRequest["y"],
      payout: RawRevealRequest["payout"]
    ) {
      const newRequest = revealRequestFromEvent(requester, location, x, y, payout);
      setRevealRequests((requests) => sortByValue(requests.concat(newRequest)));
    }

    contract.on("RevealRequested", onRevealRequested);

    return () => {
      contract.off("RevealRequested", onRevealRequested);
    };
  }, []);

  useEffect(() => {
    function onRevealCollected(_collector: unknown, location: BigNumber, _x: unknown, _y: unknown, _value: unknown) {
      const loc = locationIdFromDecStr(location.toString());
      // TODO: Track claimed separately for show/hide
      setRevealRequests((requests) => sortByValue(requests.filter((req) => req.location !== loc)));
    }

    contract.on("RevealCollected", onRevealCollected);

    return () => {
      contract.off("RevealCollected", onRevealCollected);
    };
  }, []);

  useEffect(() => {
    function onRevealCancelled(
      requester: RawRevealRequest["requester"],
      location: RawRevealRequest["location"],
      x: RawRevealRequest["x"],
      y: RawRevealRequest["y"],
      payout: RawRevealRequest["payout"],
      cancelCompleteBlock: RawRevealRequest["cancelCompleteBlock"]
    ) {
      const updatedRequest = revealRequestFromEvent(
        requester,
        location,
        x,
        y,
        payout,
        false,
        false,
        cancelCompleteBlock
      );
      console.log(updatedRequest);
      setRevealRequests((requests) => {
        // Remove the old one and add the new one
        const updated = requests.filter((req) => req.location !== updatedRequest.location).concat(updatedRequest);
        return sortByValue(updated);
      });
    }

    contract.on("RevealCancelled", onRevealCancelled);

    return () => {
      contract.off("RevealCancelled", onRevealCancelled);
    };
  }, []);

  useEffect(() => {
    function onRevealRefunded(
      requester: RawRevealRequest["requester"],
      location: RawRevealRequest["location"],
      x: RawRevealRequest["x"],
      y: RawRevealRequest["y"],
      payout: RawRevealRequest["payout"],
      cancelCompleteBlock: RawRevealRequest["cancelCompleteBlock"]
    ) {
      const updatedRequest = revealRequestFromEvent(
        requester,
        location,
        x,
        y,
        payout,
        false,
        true,
        cancelCompleteBlock
      );
      setRevealRequests((requests) => {
        // Remove the old one and add the new one
        const updated = requests.filter((req) => req.location !== updatedRequest.location).concat(updatedRequest);
        return sortByValue(updated);
      });
    }

    contract.on("RevealRefunded", onRevealRefunded);

    return () => {
      contract.off("RevealRefunded", onRevealRefunded);
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
