import type { RevealMarket } from "../../types";

import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { locationIdFromDecStr, locationIdToDecStr } from "@darkforest_eth/serde";

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
} from "../helpers/df";
import type { RevealRequest } from "../helpers/other";

const flex = {
  display: "flex",
  justifyContent: "space-between",
};

const shown = {
  ...flex,
  width: "100%",
  flexDirection: "column",
};

const hidden = {
  display: "none",
};

const muted = {
  color: "#a0a0a0",
};

const beware = {
  color: "#FF6492",
};

const revealRequestRow = {
  ...flex,
  marginBottom: "7px",
  paddingBottom: "7px",
  borderBottom: "1px solid #a0a0a0",
};

const revealRequestsList = {
  display: "flex",
  flexDirection: "column",
  overflow: "scroll",
  height: "200px",
};

const warning = {
  textAlign: "center",
  height: "50px",
};

const planetLink = {
  color: "#00ADE1",
  cursor: "pointer",
};

const bold = {
  color: "white",
};

const centered = {
  margin: "auto",
};

const optionsRow = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "6px",
};

type Props = {
  active: boolean;
  contract: RevealMarket;
  revealRequests: RevealRequest[];
};

function timeFromNow() {
  const nextReveal = getNextBroadcastAvailableTimestamp();
  return nextReveal - Date.now();
}

export function FulfillRequestsView({ active, contract, revealRequests }: Props) {
  const [waiting, setWaiting] = useState(timeFromNow);
  const [canReveal, setCanReveal] = useState(() => waiting <= 0);
  const [hideMyRequests, setHideMyRequests] = useState(true);

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
      console.error("No event target! How did this happen?");
    }
  }

  const rows = revealRequests
    .filter(({ paid, requester }) => {
      if (paid) {
        return false;
      }
      if (hideMyRequests) {
        return requester !== getAccount();
      } else {
        return true;
      }
    })
    .map(({ location, x, y, payout, requester }) => {
      function centerPlanet() {
        centerCoords({ x, y });
      }
      async function revealPlanet() {
        setCanReveal(false);
        try {
          await revealLocation(x, y);
        } catch (err) {
          // TODO: Handle
          return;
        }
        try {
          const tx = await contract.claimReveal(locationIdToDecStr(location));
          await tx.wait();
        } catch (err) {
          // TODO: Handle
        }
      }
      return html`
        <div style=${revealRequestRow} key=${location}>
          <div style=${muted}>
            <div>
              Reveal <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>
            </div>
            <div>and receive <span style=${bold}>${payout} xDai</span> from ${playerName(requester)}</div>
          </div>
          <${Button} onClick=${revealPlanet} enabled=${canReveal}>Reveal<//>
        </div>
      `;
    });

  const message = html`<span style=${centered}>No requests currently.</span>`;

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> You can only reveal once every ${REVEAL_COOLDOWN_HOURS} hours</div>
        <div>Time until your next reveal: <${TimeUntil} timestamp=${waiting} ifPassed=${"Now!"} /></div>
      </div>
      <div style=${revealRequestsList}>${rows.length ? rows : message}</div>
      <div style=${optionsRow}>
        <label><input type="checkbox" checked=${hideMyRequests} onChange=${toggleMyRequests} /> Hide my requests</label>
      </div>
    </<div>
  `;
}
