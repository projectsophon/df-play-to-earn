import { h, FunctionComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import { locationIdToDecStr } from "@darkforest_eth/serde";

import { Button } from "../components/Button";
import { TimeUntil } from "../components/TimeUntil";

import {
  REVEAL_COOLDOWN_HOURS,
  getNextBroadcastAvailableTimestamp,
  centerCoords,
  revealLocation,
  planetName,
  playerName,
  getAccount,
  isCurrentlyRevealing,
  subscribeToBlockNumber,
  getBlockNumber,
  colors,
  getPlanetByLocationId,
  isLocatable,
  getLocatablePlanetByLocationId,
} from "../helpers/df";
import { decodeCoords, getCoords, RevealRequest, ViewProps } from "../helpers/other";
import {
  shown,
  hidden,
  muted,
  bold,
  centered,
  warning,
  beware,
  scrollList,
  scrollListItem,
  jumpLink,
  optionsRow,
} from "../helpers/styles";
import { WorldCoords } from "@darkforest_eth/types";

type RowProps = {
  revealRequest: RevealRequest;
  canReveal: boolean;
  onReveal: () => Promise<void>;
  text: string;
};

function timeFromNow() {
  const nextReveal = getNextBroadcastAvailableTimestamp();
  return nextReveal - Date.now();
}

const Row: FunctionComponent<RowProps> = ({ text, revealRequest, canReveal, onReveal }) => {
  const { location, payout, requester, cancelCompleteBlock } = revealRequest;

  const planet = getLocatablePlanetByLocationId(location);
  let coords;
  if (planet) {
    coords = planet.location.coords;
  }

  const [remainingBlocks, setRemainingBlocks] = useState(() => cancelCompleteBlock - getBlockNumber());

  useEffect(() => {
    const sub = subscribeToBlockNumber((blockNumber) => {
      setRemainingBlocks(cancelCompleteBlock - blockNumber);
    });

    return sub.unsubscribe;
  }, [cancelCompleteBlock]);

  function centerPlanet() {
    if (coords) {
      centerCoords({ x: coords.x, y: coords.y });
    }
  }

  const cancelWarning =
    cancelCompleteBlock !== 0 ? (
      <div>
        <span style={beware}>Beware:</span> Only available for <span style={bold}>{remainingBlocks}</span> more blocks.
      </div>
    ) : (
      ""
    );

  return (
    <div style={scrollListItem}>
      <div style={muted}>
        <div>
          Broadcast{" "}
          {coords ? (
            <span style={jumpLink} onClick={centerPlanet}>
              {planetName(location)} ({coords.x}, {coords.y})
            </span>
          ) : (
            <span style={bold}>{planetName(location)}</span>
          )}
        </div>
        <div>
          and receive <span style={bold}>{payout} xDai</span> from {playerName(requester)}
        </div>
        {cancelWarning}
      </div>
      <Button onClick={onReveal} enabled={canReveal}>
        {text}
      </Button>
    </div>
  );
};

export function FulfillRequestsView({ active, contract, revealRequests, onStatus, pending, setPending }: ViewProps) {
  const [waiting, setWaiting] = useState(timeFromNow);
  const [canReveal, setCanReveal] = useState(() => waiting <= 0);
  const [hideMyRequests, setHideMyRequests] = useState(true);
  const [hidePendingCancel, setHidePendingCancel] = useState(false);

  useEffect(() => {
    let timer = setInterval(() => {
      if (isCurrentlyRevealing()) {
        return;
      }
      const waiting = timeFromNow();
      if (waiting <= 0) {
        setCanReveal(true);
      }
      setWaiting(waiting);
    }, 1000);

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  function toggleMyRequests(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHideMyRequests(checked);
    } else {
      console.error("[BroadcastMarketPlugin] No event target! How did this happen?");
    }
  }

  function togglePendingCancel(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHidePendingCancel(checked);
    } else {
      console.error("[BroadcastMarketPlugin] No event target! How did this happen?");
    }
  }

  const rows = revealRequests
    .filter(({ paid, refunded, requester, cancelCompleteBlock, location, isKnown }) => {
      if (paid || refunded) {
        return false;
      }
      if (cancelCompleteBlock !== 0) {
        if (cancelCompleteBlock - getBlockNumber() <= 0) {
          return false;
        }

        if (hidePendingCancel && cancelCompleteBlock > getBlockNumber()) {
          return false;
        }
      }
      if (hideMyRequests) {
        if (requester === getAccount()) {
          return false;
        }
      }

      if (isKnown) {
        return true;
      }

      const planet = getPlanetByLocationId(location);
      return isLocatable(planet);
    })
    .map((revealRequest) => {
      async function revealPlanet() {
        setPending(true);
        setCanReveal(false);
        onStatus({ message: "Attempting to broadcast... Please wait...", color: colors.dfyellow });
        let coords: WorldCoords;
        if (revealRequest.isKnown) {
          try {
            coords = await getCoords(contract, revealRequest.location);
          } catch (err) {
            console.error("[BroadcastMarketPlugin] Error fetching known coords", err);
            setPending(false);
            onStatus({ message: "Error broadcasting location. Try again.", color: colors.dfred });
            return;
          }
        } else {
          const planet = getLocatablePlanetByLocationId(revealRequest.location);
          if (planet) {
            coords = planet.location.coords;
          }
        }
        if (!coords) {
          console.error("[BroadcastMarketPlugin] Unable to get coords for planet", revealRequest.location);
          setPending(false);
          onStatus({ message: "Error broadcasting location. Try again.", color: colors.dfred });
          return;
        }
        try {
          await revealLocation(coords.x, coords.y);
        } catch (err) {
          console.error("[BroadcastMarketPlugin] Error broadcasting location", err);
          setPending(false);
          onStatus({ message: "Error broadcasting location. Try again.", color: colors.dfred });
          return;
        }
        try {
          const tx = await contract.claimReveal(locationIdToDecStr(revealRequest.location));
          await tx.wait();
          setPending(false);
          onStatus({ message: `Successfully claimed ${revealRequest.payout} xDai!`, color: colors.dfgreen });
        } catch (err) {
          console.error("[BroadcastMarketPlugin] Error claiming broadcast payout", err);
          setPending(false);
          onStatus({ message: "Error claiming. Are you the broadcaster?", color: colors.dfred });
        }
      }

      const planet = getPlanetByLocationId(revealRequest.location);

      // TODO(#58): Once revealer is exposed in the client, we need to check if the player is the revealer
      // otherwise they will pay the gas for a claim of someone else.
      if (planet?.coordsRevealed) {
        return (
          <Row
            key={revealRequest.location}
            revealRequest={revealRequest}
            onReveal={revealPlanet}
            canReveal={!pending}
            text="Claim"
          />
        );
      } else {
        return (
          <Row
            key={revealRequest.location}
            revealRequest={revealRequest}
            onReveal={revealPlanet}
            canReveal={!pending && canReveal}
            text="Broadcast"
          />
        );
      }
    });

  const message = <span style={centered}>No requests currently.</span>;

  return (
    <div style={active ? shown : hidden}>
      <div style={warning}>
        <div>
          <span style={beware}>Beware:</span> You can only broadcast once every {REVEAL_COOLDOWN_HOURS} hours
        </div>
        <div>
          Time until your next broadcast: <TimeUntil timestamp={waiting} ifPassed={"Now!"} />
        </div>
      </div>
      <div style={scrollList}>{rows.length ? rows : message}</div>
      <div style={optionsRow}>
        <label>
          <input type="checkbox" checked={hideMyRequests} onChange={toggleMyRequests} /> Hide my requests
        </label>
        <label>
          <input type="checkbox" checked={hidePendingCancel} onChange={togglePendingCancel} /> Hide requests pending
          cancel
        </label>
      </div>
    </div>
  );
}
