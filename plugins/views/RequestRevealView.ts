import type { RevealMarket } from "../../types";
import type { LocationId, Planet } from "@darkforest_eth/types";

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
import { Constants, feeFromEther, minWithoutFee, requestReveal, RevealRequest, totalFromEther } from "../helpers/other";

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

const shownStatusMessage = {
  margin: "auto",
  height: "24px",
};

const hiddenStatusMessage = {
  ...shownStatusMessage,
  visibility: "hidden",
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
  constants: Constants;
};

type StatusMessage = {
  message: string;
  color: string;
  timeout?: number;
};

function isRevealed(planet: Planet | undefined) {
  return planet?.coordsRevealed === true;
}

function hasPendingRequest(planet: Planet | undefined, revealRequests: RevealRequest[]) {
  if (!planet) return false;
  return revealRequests.findIndex((req) => req.location === planet.locationId) !== -1;
}

function canRequestReveal(planet: Planet | undefined, revealRequests: RevealRequest[], pending: LocationId | null) {
  if (!planet) {
    return false;
  }

  if (pending) {
    return false;
  }

  if (planet) {
    return !isRevealed(planet) && !hasPendingRequest(planet, revealRequests);
  } else {
    return false;
  }
}

export function RequestRevealView({ active, revealRequests, constants }: Props) {
  const [pending, setPending] = useState<LocationId | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState(getSelectedLocationId);

  const planet = getPlanetByLocationId(selectedLocationId);

  const [balance, setBalance] = useState(getMyBalance);
  const [canRequest, setCanRequest] = useState(() => canRequestReveal(planet, revealRequests, pending));
  const [xdai, setXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));
  const [minXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // This explicitly doesn't rerun for `pending` because we want to wait until we get the event from xdai
  useEffect(() => {
    setCanRequest(canRequestReveal(planet, revealRequests, pending));
  }, [planet, revealRequests]);

  useEffect(() => {
    const sub = subscribeToSelectedLocationId(setSelectedLocationId);
    return sub.unsubscribe;
  }, [setSelectedLocationId]);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

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

  const maxXdai = minWithoutFee(`${balance}`, constants.FEE_PERCENT);

  function onChangeXdai(evt: InputEvent) {
    if (evt.target) {
      const { value } = evt.target as HTMLInputElement;
      if (parseFloat(value) < balance) {
        setXdai(value);
      } else {
        setXdai(maxXdai);
      }
    } else {
      console.error("No event target! How did this happen?");
    }
  }

  // Ivan's fix didn't solve keyup
  function onKeyUp(evt: Event) {
    evt.stopPropagation();
  }

  function onKeyDown(evt: Event) {
    if (evt.target) {
      const { value } = evt.target as HTMLInputElement;
      if (parseFloat(value) < balance) {
        setXdai(value);
      } else {
        setXdai(maxXdai);
      }
    } else {
      console.error("No event target! How did this happen?");
    }
  }

  const totalEther = totalFromEther(xdai, constants.FEE_PERCENT);
  const feeEther = feeFromEther(totalEther, constants.FEE_PERCENT);

  async function onClick() {
    setCanRequest(false);
    setStatusMessage({ message: "Sending reveal request... Please wait...", color: "white" });
    setPending(selectedLocationId);
    try {
      await requestReveal(selectedLocationId, totalEther);
      setStatusMessage({ message: "Successfully posted reveal request!", color: "#00DC82", timeout: 5000 });
      setPending(null);
    } catch (err) {
      setStatusMessage({ message: err.message, color: "#FF6492" });
      setPending(null);
    }
  }

  let btnMessage = "Request Reveal";
  if (isRevealed(planet)) {
    btnMessage = "Planet already revealed!";
  }

  if (hasPendingRequest(planet, revealRequests)) {
    btnMessage = "Reveal request already exists!";
  }

  if (pending) {
    btnMessage = "Requesting...";
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
            max=${maxXdai}
            onChange=${onChangeXdai}
            step="0.1"
            onKeyUp=${onKeyUp}
            onKeyDown=${onKeyDown}
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
      <div style=${row}>
        <span style=${statusMessage ? { ...shownStatusMessage, color: statusMessage.color } : hiddenStatusMessage}
          >${statusMessage?.message}</span
        >
      </div>
      <${Button} style=${fullWidth} onClick=${onClick} enabled=${canRequest}>${btnMessage}<//>
    </div>
  `;
}
