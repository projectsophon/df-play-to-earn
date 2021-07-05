import type { Planet, LocationId } from "@darkforest_eth/types";

import { h } from "preact";
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
import { EMPTY_LOCATION_ID } from "@darkforest_eth/constants";
import { locationIdToDecStr, locationIdFromDecStr } from "@darkforest_eth/serde";

const shown = {
  ...baseShown,
  height: "100%",
};

const row = {
  ...flex,
  margin: "7px 0",
};

const inpt = {
  color: "#080808",
  padding: "0 0 0 7px",
  borderRadius: "3px",
};

const paymentInput = {
  ...inpt,
  width: "100px",
  marginRight: "5px",
};

const locationInput = {
  ...inpt,
  width: "170px",
};

const btn = {
  width: "170px",
  marginLeft: "auto",
};

function isRevealed(locationId: LocationId | undefined) {
  const planet = getPlanetByLocationId(locationId);
  if (planet) {
    return planet.coordsRevealed;
  } else {
    return false;
  }
}

function hasPendingRequest(locationId: LocationId | undefined, revealRequests: RevealRequest[]) {
  return revealRequests.findIndex((req) => req.location === locationId) !== -1;
}

function canRequestReveal(locationId: LocationId | undefined, revealRequests: RevealRequest[]) {
  if (!locationId) {
    return false;
  }

  if (locationId === EMPTY_LOCATION_ID) {
    return false;
  }

  if (hasPendingRequest(locationId, revealRequests)) {
    return false;
  }

  if (isRevealed(locationId)) {
    return false;
  }

  try {
    // locationIdFromDecStr will throw if it is invalid
    // TODO: Would be nice to just have a validate function
    if (locationIdFromDecStr(locationIdToDecStr(locationId))) {
      return true;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function RequestRevealView({ active, revealRequests, constants, onStatus, pending, setPending }: ViewProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<LocationId>(undefined);

  const [balance, setBalance] = useState(getMyBalance);
  const [canRequest, setCanRequest] = useState(() => canRequestReveal(selectedLocationId, revealRequests));
  const [xdai, setXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));
  const [minXdai] = useState(() => minWithoutFee(constants.REQUEST_MINIMUM, constants.FEE_PERCENT));

  useEffect(() => {
    setCanRequest(canRequestReveal(selectedLocationId, revealRequests));
  }, [selectedLocationId, revealRequests]);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

  const maxXdai = minWithoutFee(`${balance}`, constants.FEE_PERCENT);

  function onChangeXdai(evt: h.JSX.TargetedEvent<HTMLInputElement>) {
    const { value } = evt.currentTarget;
    try {
      setXdai(formatEther(parseEther(value)));
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Not a valid Ether value.");
    }
  }

  function onUseSelected() {
    const locationId = getSelectedLocationId() || ("" as LocationId);
    setSelectedLocationId(locationId);
  }

  function onChangeLocationId(evt: h.JSX.TargetedEvent<HTMLInputElement>) {
    const { value } = evt.currentTarget;
    setSelectedLocationId(value as LocationId);
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
      setCanRequest(canRequestReveal(selectedLocationId, revealRequests));
      onStatus({ message: "Successfully posted broadcast request!", color: colors.dfgreen, timeout: 5000 });
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Error requesting broadcast", err);
      setPending(false);
      setCanRequest(canRequestReveal(selectedLocationId, revealRequests));
      onStatus({ message: "Error requesting broadcast. Try again.", color: colors.dfred });
    }
  }

  let btnMessage = "Request broadcast";
  if (!selectedLocationId) {
    btnMessage = "No Location ID specified.";
  }

  if (isRevealed(selectedLocationId)) {
    btnMessage = "Planet already broadcasted!";
  }

  if (hasPendingRequest(selectedLocationId, revealRequests)) {
    btnMessage = "Broadcast request already exists!";
  }

  if (pending) {
    btnMessage = "Wait...";
  }

  return (
    <div style={active ? shown : hidden}>
      <div style={warning}>
        <span style={beware}>Beware:</span> You will be spending actual xDai here!
      </div>
      <div style={row}>
        <span>Location ID:</span>
        <input style={locationInput} type="text" value={selectedLocationId} onKeyUp={onChangeLocationId} />
      </div>
      <div style={row}>
        <button style={btn} onClick={onUseSelected}>
          Use Selected Planet
        </button>
      </div>
      <div style={row}>
        <span>Your xDai Balance:</span>
        <span>{balance} xDai</span>
      </div>
      <div style={row}>
        <span>Paying:</span>
        <span>
          <input
            type="number"
            style={paymentInput}
            value={xdai}
            min={minXdai}
            max={maxXdai}
            onChange={onChangeXdai}
            step="0.1"
            onKeyUp={onKeyUp}
          />
          <label>xDai</label>
        </span>
      </div>
      <div style={row}>
        <span>Fee:</span>
        <span>{feeEther} xDai</span>
      </div>
      <div style={row}>
        <span>Total:</span>
        <span>{totalEther} xDai</span>
      </div>
      <Button onClick={onClick} enabled={!pending && canRequest}>
        {btnMessage}
      </Button>
    </div>
  );
}
