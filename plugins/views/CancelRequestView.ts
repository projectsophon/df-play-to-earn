import type { BroadcastMarket } from "../../types";
import type { RevealRequest, StatusMessage, ViewProps } from "../helpers/other";

import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { locationIdToDecStr } from "@darkforest_eth/serde";

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
import {
  shown,
  hidden,
  beware,
  muted,
  bold,
  centered,
  warning,
  scrollList,
  scrollListItem,
  jumpLink,
  optionsRow,
} from "../helpers/styles";

type RowProps = {
  cancelledCountdownBlocks: number;
  revealRequest: RevealRequest;
  contract: BroadcastMarket;
  onStatus: (status: StatusMessage) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
};

function PaidRow({ revealRequest }: RowProps) {
  const { x, y, payout, location, collector } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }

  return html`
    <div style=${scrollListItem}>
      <div style=${muted}>
        <div>
          <span style=${jumpLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span> was broadcasted!
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
    <div style=${scrollListItem}>
      <div style=${muted}>
        <div>
          <span style=${jumpLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span> request refunded.
        </div>
        <div>You got <span style=${bold}>${payout} xDai</span> back.</div>
      </div>
    </div>
  `;
}

function CancelRow({ cancelledCountdownBlocks, revealRequest, contract, onStatus, pending, setPending }: RowProps) {
  const { x, y, payout, location } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function cancelReveal() {
    setPending(true);
    onStatus({ message: "Attempting to cancel request... Please wait...", color: colors.dfyellow });
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
      console.error("[BroadcastMarketPlugin] Error cancelling broadcast request", err);
      setPending(false);
      onStatus({ message: "Error cancelling request. Try again.", color: colors.dfred });
    }
  }

  const message = pending ? "Wait..." : "Cancel";

  return html`
    <div style=${scrollListItem}>
      <div style=${muted}>
        <div>Cancel <span style=${jumpLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span></div>
        <div>
          and claim <span style=${bold}>${payout} xDai</span> refund in
          <span style=${bold}> ${cancelledCountdownBlocks} blocks</span>.
        </div>
      </div>
      <${Button} onClick=${cancelReveal} enabled=${!pending}>${message}<//>
    </div>
  `;
}

function RefundRow({ revealRequest, contract, onStatus, pending, setPending }: RowProps) {
  const { x, y, payout, location, cancelCompleteBlock } = revealRequest;

  const [remainingBlocks, setRemainingBlocks] = useState(() => cancelCompleteBlock - getBlockNumber());

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function claimRefund() {
    setPending(true);
    onStatus({ message: "Attempting to claim refund... Please wait...", color: colors.dfyellow });
    try {
      const tx = await contract.claimRefund(locationIdToDecStr(location));
      await tx.wait();
      setPending(false);
      onStatus({ message: `Successully claimed ${payout} xDai refund.`, color: colors.dfgreen, timeout: 5000 });
    } catch (err) {
      console.error("[BroadcastMarketPlugin] Error claiming refund", err);
      setPending(false);
      onStatus({ message: "Error claiming refund. Please try again.", color: colors.dfred });
    }
  }

  useEffect(() => {
    const sub = subscribeToBlockNumber((blockNumber) => {
      setRemainingBlocks(cancelCompleteBlock - blockNumber);
    });

    return sub.unsubscribe;
  }, [cancelCompleteBlock]);

  const message = remainingBlocks > 0 ? "Wait..." : "Claim!";

  return html`
    <div style=${scrollListItem}>
      <div style=${muted}>
        <div>
          Claim refund of <span style=${bold}>${payout} xDai</span> in
          <span style=${bold}> ${remainingBlocks > 0 ? remainingBlocks : 0}</span> blocks
        </div>
        <div>for <span style=${jumpLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>.</div>
      </div>
      <${Button} onClick=${claimRefund} enabled=${remainingBlocks <= 0 && !pending}>${message}<//>
    </div>
  `;
}

export function CancelRequestView({
  active,
  contract,
  revealRequests,
  constants,
  onStatus,
  pending,
  setPending,
}: ViewProps) {
  const cancelledCountdownBlocks = constants.CANCELLED_COUNTDOWN_BLOCKS;

  const [hideClaimed, setHideClaimed] = useState(false);
  const [hideRefunded, setHideRefunded] = useState(false);

  function toggleClaimed(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHideClaimed(checked);
    } else {
      console.error("[BroadcastMarketPlugin] No event target! How did this happen?");
    }
  }
  function toggleRefunded(evt: Event) {
    if (evt.target) {
      const { checked } = evt.target as HTMLInputElement;
      setHideRefunded(checked);
    } else {
      console.error("[BroadcastMarketPlugin] No event target! How did this happen?");
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
          pending=${pending}
          setPending=${setPending}
        />`;
      } else {
        return html`<${RefundRow}
          key=${revealRequest.location}
          revealRequest=${revealRequest}
          contract=${contract}
          onStatus=${onStatus}
          pending=${pending}
          setPending=${setPending}
        />`;
      }
    });

  const message = html`<span style=${centered}>No requests currently.</span>`;

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> Players can still claim a broadcast for ${cancelledCountdownBlocks} blocks after you try to cancel.</div>
      </div>
      <div style=${scrollList}>${rows.length ? rows : message}</div>
      <div style=${optionsRow}>
        <label><input type="checkbox" checked=${hideClaimed} onChange=${toggleClaimed} /> Hide claimed</label>
        <label><input type="checkbox" checked=${hideRefunded} onChange=${toggleRefunded} /> Hide refunded</label>
      </div>
    </<div>
  `;
}
