import { locationIdToDecStr } from "@darkforest_eth/serde";
import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { RevealMarket } from "../../types";
import { Button } from "../components/Button";
import { centerCoords, getAccount, getBlockNumber, planetName, subscribeToBlockNumber } from "../helpers/df";
import { Constants, RevealRequest } from "../helpers/other";

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

const centered = {
  margin: "auto",
};

const bold = {
  color: "white",
};

type Props = {
  active: boolean;
  contract: RevealMarket;
  revealRequests: RevealRequest[];
  constants: Constants;
};

type PaidRowProps = {
  revealRequest: RevealRequest;
};

type CancelRowProps = {
  cancelledCountdownBlocks: number;
  revealRequest: RevealRequest;
  contract: RevealMarket;
};

type RefundRowProps = {
  revealRequest: RevealRequest;
  contract: RevealMarket;
};

function PaidRow({ revealRequest }: PaidRowProps) {
  const { x, y, payout, location } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }

  const collector = "Someone";

  return html`
    <div style=${revealRequestRow} key=${location}>
      <div style=${muted}>
        <div>
          <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span> was revealed!
        </div>
        <div>${collector} claimed <span style=${bold}>${payout} xDai</span>.</div>
      </div>
    </div>
  `;
}

function RefundedRow({ revealRequest }: PaidRowProps) {
  const { x, y, payout, location } = revealRequest;

  function centerPlanet() {
    centerCoords({ x, y });
  }

  return html`
    <div style=${revealRequestRow} key=${location}>
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

function CancelRow({ cancelledCountdownBlocks, revealRequest, contract }: CancelRowProps) {
  const { x, y, payout, location } = revealRequest;

  const [pending, setPending] = useState(false);

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function cancelReveal() {
    setPending(true);

    try {
      const tx = await contract.cancelReveal(locationIdToDecStr(location));
      await tx.wait();
      setPending(false);
    } catch (err) {
      // TODO: Handle;
    }
  }

  const message = pending ? "Wait..." : "Cancel";

  return html`
    <div style=${revealRequestRow} key=${location}>
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

function RefundRow({ revealRequest, contract }: RefundRowProps) {
  const { x, y, payout, location, cancelCompleteBlock } = revealRequest;

  const [remainingBlocks, setRemainingBlocks] = useState(() => cancelCompleteBlock - getBlockNumber());
  const [pending, setPending] = useState(false);

  function centerPlanet() {
    centerCoords({ x, y });
  }
  async function cancelReveal() {
    setPending(true);
    try {
      const tx = await contract.claimRefund(locationIdToDecStr(location));
      await tx.wait();
    } catch (err) {
      // TODO: Handle;
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
    <div style=${revealRequestRow} key=${location}>
      <div style=${muted}>
        <div>
          Claim refund of <span style=${bold}>${payout} xDai</span> in
          <span style=${bold}> ${remainingBlocks > 0 ? remainingBlocks : 0}</span> blocks
        </div>
        <div>for <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>.</div>
      </div>
      <${Button} onClick=${cancelReveal} enabled=${remainingBlocks <= 0 && !pending}>${message}<//>
    </div>
  `;
}

export function CancelRequestView({ active, contract, revealRequests, constants }: Props) {
  const cancelledCountdownBlocks = constants.CANCELLED_COUNTDOWN_BLOCKS;

  const rows = revealRequests
    .filter(({ requester }) => requester === getAccount())
    .map((revealRequest) => {
      if (revealRequest.paid) {
        return html`<${PaidRow} revealRequest=${revealRequest} />`;
      }
      if (revealRequest.refunded) {
        return html`<${RefundedRow} revealRequest=${revealRequest} />`;
      }
      if (revealRequest.cancelCompleteBlock === 0) {
        return html`<${CancelRow}
          cancelledCountdownBlocks=${cancelledCountdownBlocks}
          revealRequest=${revealRequest}
          contract=${contract}
        />`;
      } else {
        return html`<${RefundRow} revealRequest=${revealRequest} contract=${contract} />`;
      }
    });

  const message = html`<span style=${centered}>No requests currently.</span>`;

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${warning}>
        <div><span style=${beware}>Beware:</span> Players can still claim a reveal for ${cancelledCountdownBlocks} blocks after you try to cancel.</div>
      </div>
      <div style=${revealRequestsList}>${rows.length ? rows : message}</div>
    </<div>
  `;
}
