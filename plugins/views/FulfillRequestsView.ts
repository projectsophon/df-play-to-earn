import { html } from "htm/preact";
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
  getPlanetByCoords,
} from "../helpers/df";
import type { RevealRequest, ViewProps } from "../helpers/other";
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

function Row({ text, revealRequest, canReveal, onReveal }: RowProps) {
  const { x, y, location, payout, requester, cancelCompleteBlock } = revealRequest;

  const [remainingBlocks, setRemainingBlocks] = useState(() => cancelCompleteBlock - getBlockNumber());

  useEffect(() => {
    const sub = subscribeToBlockNumber((blockNumber) => {
      setRemainingBlocks(cancelCompleteBlock - blockNumber);
    });

    return sub.unsubscribe;
  }, [cancelCompleteBlock]);

  function centerPlanet() {
    centerCoords({ x, y });
  }

  const cancelWarning =
    cancelCompleteBlock !== 0
      ? html`<div>
          <span style=${beware}>Beware:</span> Only available for <span style=${bold}>${remainingBlocks}</span> more
          blocks.
        </div>`
      : "";

  return html`
    <div style=${scrollListItem}>
      <div style=${muted}>
        <div>Broadcast <span style=${jumpLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span></div>
        <div>and receive <span style=${bold}>${payout} xDai</span> from ${playerName(requester)}</div>
        ${cancelWarning}
      </div>
      <${Button} onClick=${onReveal} enabled=${canReveal}>${text}<//>
    </div>
  `;
}

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
    .filter(({ paid, refunded, requester, cancelCompleteBlock }) => {
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
        return requester !== getAccount();
      } else {
        return true;
      }
    })
    .map((revealRequest) => {
      async function revealPlanet() {
        setPending(true);
        setCanReveal(false);
        onStatus({ message: "Attempting to broadcast... Please wait...", color: colors.dfyellow });
        try {
          await revealLocation(revealRequest.x, revealRequest.y);
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

      const planet = getPlanetByCoords({ x: revealRequest.x, y: revealRequest.y });

      // TODO(#58): Once revealer is exposed in the client, we need to check if the player is the revealer
      // otherwise they will pay the gas for a claim of someone else.
      if (planet?.coordsRevealed) {
        return html`<${Row}
          key=${revealRequest.location}
          revealRequest=${revealRequest}
          onReveal=${revealPlanet}
          canReveal=${!pending}
          text="Claim"
        />`;
      } else {
        return html`<${Row}
          key=${revealRequest.location}
          revealRequest=${revealRequest}
          onReveal=${revealPlanet}
          canReveal=${!pending && canReveal}
          text="Broadcast"
        />`;
      }
    });

  const message = html`<span style=${centered}>No requests currently.</span>`;

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> You can only broadcast once every ${REVEAL_COOLDOWN_HOURS} hours</div>
        <div>Time until your next broadcast: <${TimeUntil} timestamp=${waiting} ifPassed=${"Now!"} /></div>
      </div>
      <div style=${scrollList}>${rows.length ? rows : message}</div>
      <div style=${optionsRow}>
        <label><input type="checkbox" checked=${hideMyRequests} onChange=${toggleMyRequests} /> Hide my requests</label>
        <label><input type="checkbox" checked=${hidePendingCancel} onChange=${togglePendingCancel} /> Hide requests pending cancel</label>
      </div>
    </<div>
  `;
}
