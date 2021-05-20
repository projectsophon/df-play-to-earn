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

type Props = {
  active: boolean;
  contract: RevealMarket;
  revealRequests: RevealRequest[];
};

export function FulfillRequestsView({ active, contract, revealRequests }: Props) {
  const [nextReveal, setNextReveal] = useState(getNextBroadcastAvailableTimestamp);

  const [canReveal, setCanReveal] = useState(() => nextReveal <= Date.now());

  function onAvailable() {
    setNextReveal(getNextBroadcastAvailableTimestamp());
    setCanReveal(true);
  }

  const rows = revealRequests
    .filter(({ paid }) => !paid)
    .map(({ location, x, y, value, requester }) => {
      function centerPlanet() {
        centerCoords({ x, y });
      }
      async function revealPlanet() {
        setCanReveal(false);
        await revealLocation(x, y);
        await contract.claimReveal(locationIdToDecStr(location));
        // TODO: When does the player get updated?
        setNextReveal(getNextBroadcastAvailableTimestamp());
      }
      return html`
        <div style=${revealRequestRow} key=${location}>
          <div style=${muted}>
            <div>
              Reveal <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>
            </div>
            <div>and receive <span style=${bold}>${value} xDai</span> from ${playerName(requester)}</div>
          </div>
          <${Button} onClick=${revealPlanet} enabled=${canReveal}>Reveal<//>
        </div>
      `;
    });

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> You can only reveal once every ${REVEAL_COOLDOWN_HOURS} hours</div>
        <div>Time until your next reveal: <${TimeUntil} timestamp=${nextReveal} ifPassed=${"Now!"} onAvailable=${onAvailable} /></div>
      </div>
      <div style=${revealRequestsList}>${rows}</div>
    </<div>
  `;
}
