import { locationIdToDecStr } from "@darkforest_eth/serde";
import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { RevealMarket } from "../../types";
import { Button } from "../components/Button";
import {
  centerCoords,
  colors,
  getAccount,
  getBlockNumber,
  planetName,
  playerName,
  subscribeToBlockNumber,
} from "../helpers/df";
import { RevealRequest, StatusMessage, ViewProps } from "../helpers/other";

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
  color: colors.dfred,
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

const centered = {
  margin: "auto",
};

const bold = {
  color: "white",
};

const optionsRow = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "6px",
};

type RowProps = {
  cancelledCountdownBlocks: number;
  revealRequest: RevealRequest;
  contract: RevealMarket;
  onStatus: (status: StatusMessage) => void;
};

function PaidRow({ revealRequest }: RowProps) {
  const { x, y, payout, location, collector } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }

  return html`
    <div style=${revealRequestRow}>
      <div style=${muted}>
        <div>
          <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span> was revealed!
        </div>
        <div>${playerName(collector)} claimed <span style=${bold}>${payout} xDai</span>.</div>
      </div>
    </div>
  `;
}

function RefundedRow({ revealRequest }: RowProps) {
  const { x, y, payout, location } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }

  return html`
    <div style=${revealRequestRow}>
      <div style=${muted}>
        <div>
          <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span> request
          refunded.
        </div>
        <div>You got <span style=${bold}>${payout} xDai</span> back.</div>
      </div>
    </div>
  `;
}

function CancelRow({ cancelledCountdownBlocks, revealRequest, contract, onStatus }: RowProps) {
  const { x, y, payout, location } = revealRequest;

  const [pending, setPending] = useState(false);

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function cancelReveal() {
    setPending(true);
    onStatus({ message: "Attempting to cancel request... Please wait...", color: colors.dfwhite });
    try {
      const tx = await contract.cancelReveal(locationIdToDecStr(location));
      await tx.wait();
      setPending(false);
      onStatus({
        message: `Cancel requested. Claim refund in ${cancelledCountdownBlocks} blocks.`,
        color: colors.dfgreen,
        timeout: 5000,
      });
    } catch (err) {
      console.error("Error cancelling reveal request", err);
      onStatus({ message: "Error cancelling request. Try again.", color: colors.dfred });
    }
  }

  const message = pending ? "Wait..." : "Cancel";

  return html`
    <div style=${revealRequestRow}>
      <div style=${muted}>
        <div>Cancel <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span></div>
        <div>
          and claim <span style=${bold}>${payout} xDai</span> refund in
          <span style=${bold}> ${cancelledCountdownBlocks} blocks</span>.
        </div>
      </div>
      <${Button} onClick=${cancelReveal} enabled=${!pending}>${message}<//>
    </div>
  `;
}

function RefundRow({ revealRequest, contract, onStatus }: RowProps) {
  const { x, y, payout, location, cancelCompleteBlock } = revealRequest;

  const [remainingBlocks, setRemainingBlocks] = useState(() => cancelCompleteBlock - getBlockNumber());
  const [pending, setPending] = useState(false);

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function claimRefund() {
    setPending(true);
    onStatus({ message: "Attempting to claim refund... Please wait...", color: colors.dfwhite });
    try {
      const tx = await contract.claimRefund(locationIdToDecStr(location));
      await tx.wait();
      onStatus({ message: `Successully claimed ${payout} xDai refund.`, color: colors.dfgreen, timeout: 5000 });
    } catch (err) {
      console.error("Error claiming refund", err);
      onStatus({ message: "Error claiming refund. Please try again.", color: colors.dfred });
    }
  }

  useEffect(() => {
    const sub = subscribeToBlockNumber((blockNumber) => {
      setRemainingBlocks(cancelCompleteBlock - blockNumber);
    });

    return sub.unsubscribe;
  });

  const message = remainingBlocks > 0 ? "Wait..." : "Claim!";

  return html`
    <div style=${revealRequestRow}>
      <div style=${muted}>
        <div>
          Claim refund of <span style=${bold}>${payout} xDai</span> in
          <span style=${bold}> ${remainingBlocks > 0 ? remainingBlocks : 0}</span> blocks
        </div>
        <div>for <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>.</div>
      </div>
      <${Button} onClick=${claimRefund} enabled=${remainingBlocks <= 0 && !pending}>${message}<//>
    </div>
  `;
}

export function CancelRequestView({ active, contract, revealRequests, constants, onStatus }: ViewProps) {
  const cancelledCountdownBlocks = constants.CANCELLED_COUNTDOWN_BLOCKS;

  const [hideClaimed, setHideClaimed] = useState(false);
  const [hideRefunded, setHideRefunded] = useState(false);

  function toggleClaimed(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHideClaimed(checked);
    } else {
      console.error("No event target! How did this happen?");
    }
  }
  function toggleRefunded(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHideRefunded(checked);
    } else {
      console.error("No event target! How did this happen?");
    }
  }

  const rows = revealRequests
    .filter(({ paid, refunded, requester }) => {
      if (hideClaimed) {
        if (paid) {
          return false;
        }
      }
      if (hideRefunded) {
        if (refunded) {
          return false;
        }
      }
      return requester === getAccount();
    })
    .map((revealRequest) => {
      if (revealRequest.paid) {
        return html`<${PaidRow} key=${revealRequest.location} revealRequest=${revealRequest} />`;
      }
      if (revealRequest.refunded) {
        return html`<${RefundedRow} key=${revealRequest.location} revealRequest=${revealRequest} />`;
      }
      if (revealRequest.cancelCompleteBlock === 0) {
        return html`<${CancelRow}
          key=${revealRequest.location}
          cancelledCountdownBlocks=${cancelledCountdownBlocks}
          revealRequest=${revealRequest}
          contract=${contract}
          onStatus=${onStatus}
        />`;
      } else {
        return html`<${RefundRow}
          key=${revealRequest.location}
          revealRequest=${revealRequest}
          contract=${contract}
          onStatus=${onStatus}
        />`;
      }
    });

  const message = html`<span style=${centered}>No requests currently.</span>`;

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> Players can still claim a reveal for ${cancelledCountdownBlocks} blocks after you try to cancel.</div>
      </div>
      <div style=${revealRequestsList}>${rows.length ? rows : message}</div>
      <div style=${optionsRow}>
        <label><input type="checkbox" checked=${hideClaimed} onChange=${toggleClaimed} /> Hide claimed</label>
        <label><input type="checkbox" checked=${hideRefunded} onChange=${toggleRefunded} /> Hide refunded</label>
      </div>
    </<div>
  `;
}
