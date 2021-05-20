import type { RevealMarket } from "../../types";
import type { LocationId } from "@darkforest_eth/types";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

import { Button } from "../components/Button";

import {
  getSelectedLocationId,
  getMyBalance,
  subscribeToSelectedLocationId,
  subscribeToMyBalance,
  planetName,
  getPlanetByLocationId,
} from "../helpers/df";
import { requestReveal, RevealRequest } from "../helpers/other";

const flex = {
  display: "flex",
  justifyContent: "space-between",
};

const shown = {
  ...flex,
  width: "100%",
  height: "100%",
  flexDirection: "column",
};

const hidden = {
  display: "none",
};

const row = {
  ...flex,
  margin: "7px 0",
};

const bottomRow = {
  ...flex,
  flex: "1 0",
  justifyContent: "flex-end",
  flexDirection: "column",
};

const paymentInput = {
  color: "#080808",
  padding: "0 0 0 7px",
  width: "100px",
  marginRight: "5px",
  borderRadius: "3px",
};

// TODO: Not red?
const beware = {
  color: "#FF6492",
};

const warning = {
  textAlign: "center",
};

const fullWidth = {
  width: "100%",
};

type Props = {
  active: boolean;
  contract: RevealMarket;
  revealRequests: RevealRequest[];
};

export function RequestRevealView({ active, revealRequests }: Props) {
  const [pending, setPending] = useState<LocationId | null>(null);

  function canRequestReveal(locationId?: LocationId) {
    if (!locationId) {
      return false;
    }

    if (pending) {
      return false;
    }

    const planet = getPlanetByLocationId(locationId);
    if (planet) {
      return planet.coordsRevealed === false && revealRequests.findIndex((req) => req.location === locationId) === -1;
    } else {
      return false;
    }
  }

  const [selectedLocationId, setSelectedLocationId] = useState(getSelectedLocationId);
  const [balance, setBalance] = useState(getMyBalance);
  const [canRequest, setCanRequest] = useState(() => canRequestReveal(selectedLocationId));
  const [xdai, setXdai] = useState("1.0");
  const [minXdai, setMinXdai] = useState("1.0");

  useEffect(() => {
    setCanRequest(canRequestReveal(selectedLocationId));
  }, [selectedLocationId]);

  useEffect(() => {
    const sub = subscribeToSelectedLocationId(setSelectedLocationId);
    return sub.unsubscribe;
  }, [setSelectedLocationId]);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

  function onChangeXdai(evt: InputEvent) {
    if (evt.target) {
      setXdai((evt.target as HTMLInputElement).value);
    } else {
      console.log("No event target! How did this happen?");
    }
  }

  // Might not need this with Ivan's fixes
  function onKeyUp(evt: Event) {
    evt.stopPropagation();
  }

  function onClick() {
    setCanRequest(false);
    setPending(selectedLocationId);
    requestReveal(selectedLocationId, xdai).then(() => {
      setPending(null);
      setCanRequest(canRequestReveal(selectedLocationId));
    });
  }

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}><span style=${beware}>Beware:</span> You will be spending actual xDai here!</div>
      <div style=${row}>
        <span>Your xDai Balance:</span>
        <span>${balance} xDai</span>
      </div>
      <div style=${row}>
        <span>Request Reveal of:</span>
        <span>${planetName(selectedLocationId)}</span>
      </div>
      <div style=${row}>
        <span>Paying:</span>
        <span>
          <input
            type="number"
            style=${paymentInput}
            value=${xdai}
            min=${minXdai}
            onChange=${onChangeXdai}
            step="0.1"
            onKeyUp=${onKeyUp}
          />
          <label>xDai</label>
        </span>
      </div>
      <div style=${bottomRow}>
        <${Button} style=${fullWidth} onClick=${onClick} enabled=${canRequest}>Request Reveal<//>
      </div>
    </div>
  `;
}
