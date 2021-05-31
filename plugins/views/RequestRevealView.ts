import type { Planet } from "@darkforest_eth/types";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { formatEther, parseEther } from "@ethersproject/units";

import { Button } from "../components/Button";

import {
  getSelectedLocationId,
  getMyBalance,
  subscribeToSelectedLocationId,
  subscribeToMyBalance,
  planetName,
  getPlanetByLocationId,
  colors,
} from "../helpers/df";
import {
  feeFromEther,
  minWithoutFee,
  requestReveal,
  RevealRequest,
  sumEtherStrings,
  ViewProps,
} from "../helpers/other";
import { flex, hidden, beware, warning, fullWidth, shown as baseShown } from "../helpers/styles";

const shown = {
  ...baseShown,
  height: "100%",
};

const row = {
  ...flex,
  margin: "7px 0",
};

const paymentInput = {
  color: "#080808",
  padding: "0 0 0 7px",
  width: "100px",
  marginRight: "5px",
  borderRadius: "3px",
};

function isRevealed(planet: Planet | undefined) {
  return planet?.coordsRevealed === true;
}

function hasPendingRequest(planet: Planet | undefined, revealRequests: RevealRequest[]) {
  if (!planet) return false;
  return revealRequests.findIndex((req) => req.location === planet.locationId) !== -1;
}

function canRequestReveal(planet: Planet | undefined, revealRequests: RevealRequest[]) {
  if (planet) {
    return !isRevealed(planet) && !hasPendingRequest(planet, revealRequests);
  } else {
    return false;
  }
}

export function RequestRevealView({ active, revealRequests, constants, onStatus, pending, setPending }: ViewProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(getSelectedLocationId);

  const planet = getPlanetByLocationId(selectedLocationId);

  const [balance, setBalance] = useState(getMyBalance);
  const [canRequest, setCanRequest] = useState(() => canRequestReveal(planet, revealRequests));
  const [xdai, setXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));
  const [minXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));

  useEffect(() => {
    setCanRequest(canRequestReveal(planet, revealRequests));
  }, [planet, revealRequests]);

  useEffect(() => {
    const sub = subscribeToSelectedLocationId(setSelectedLocationId);
    return sub.unsubscribe;
  }, [setSelectedLocationId]);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

  const maxXdai = minWithoutFee(`${balance}`, constants.FEE_PERCENT);

  function onChangeXdai(evt: InputEvent) {
    if (evt.target) {
      const { value } = evt.target as HTMLInputElement;
      try {
        setXdai(formatEther(parseEther(value)));
      } catch (err) {
        console.error("[BroadcastMarketPlugin] Not a valid Ether value.");
      }
    } else {
      console.error("[BroadcastMarketPlugin] No event target! How did this happen?");
    }
  }

  // Ivan's fix didn't solve keyup
  function onKeyUp(evt: Event) {
    evt.stopPropagation();
  }

  const feeEther = feeFromEther(xdai, constants.FEE_PERCENT);
  const totalEther = sumEtherStrings(xdai, feeEther);

  async function onClick() {
    setPending(true);
    setCanRequest(false);
    onStatus({ message: "Sending broadcast request... Please wait...", color: colors.dfyellow });
    try {
      await requestReveal(selectedLocationId, totalEther);
      setPending(false);
      setCanRequest(canRequestReveal(planet, revealRequests));
      onStatus({ message: "Successfully posted broadcast request!", color: colors.dfgreen, timeout: 5000 });
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Error requesting broadcast", err);
      setPending(false);
      setCanRequest(canRequestReveal(planet, revealRequests));
      onStatus({ message: "Error requesting broadcast. Try again.", color: colors.dfred });
    }
  }

  let btnMessage = "Request broadcast";
  if (!planet) {
    btnMessage = "No planet selected.";
  }

  if (isRevealed(planet)) {
    btnMessage = "Planet already broadcasted!";
  }

  if (hasPendingRequest(planet, revealRequests)) {
    btnMessage = "Broadcast request already exists!";
  }

  if (pending) {
    btnMessage = "Wait...";
  }

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}><span style=${beware}>Beware:</span> You will be spending actual xDai here!</div>
      <div style=${row}>
        <span>Your xDai Balance:</span>
        <span>${balance} xDai</span>
      </div>
      <div style=${row}>
        <span>Request broadcast of:</span>
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
            max=${maxXdai}
            onChange=${onChangeXdai}
            step="0.1"
            onKeyUp=${onKeyUp}
          />
          <label>xDai</label>
        </span>
      </div>
      <div style=${row}>
        <span>Fee:</span>
        <span>${feeEther} xDai</span>
      </div>
      <div style=${row}>
        <span>Total:</span>
        <span>${totalEther} xDai</span>
      </div>
      <${Button} style=${fullWidth} onClick=${onClick} enabled=${!pending && canRequest}>${btnMessage}<//>
    </div>
  `;
}
