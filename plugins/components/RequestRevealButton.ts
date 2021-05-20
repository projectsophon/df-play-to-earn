import type { RevealMarket } from "../../types";
import type { LocationId } from "@darkforest_eth/types";
import type { RevealSnarkContractCallArgs } from "@darkforest_eth/snarks";

import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { parseEther } from "@ethersproject/units";

import { Button } from "./Button";

import { getPlanetByLocationId, revealSnarkArgs } from "../helpers/df";

type Props = {
  locationId?: LocationId;
  xdai: string;
  contract: RevealMarket;
  onSubmit: () => void;
};

const fullWidth = {
  width: "100%",
};

async function requestReveal({ locationId, xdai, contract }: Props) {
  console.log("request reveal", locationId);
  const planet = getPlanetByLocationId(locationId);
  if (!planet) {
    console.log("no planet");
    return;
  }
  if (planet.coordsRevealed) {
    console.log("already revealed");
    return;
  }
  //@ts-expect-error Because we don't have isLocatable
  if (!planet?.location?.coords) {
    console.log("Don't know the location");
    return;
  }

  //@ts-expect-error Because we don't have isLocatable
  const { x, y } = planet.location.coords;
  try {
    const snarkArgs = await revealSnarkArgs(x, y);
    const receipt = await contract.requestReveal(...snarkArgs, {
      value: parseEther(xdai),
    });
    await receipt.wait();
    console.log("RevealRequest posted");
  } catch (err) {
    // TODO: Propagate error
    console.log("Error requesting", err);
  }
}

function canRequestReveal(locationId?: LocationId) {
  if (!locationId) {
    return false;
  }

  const planet = getPlanetByLocationId(locationId);
  if (planet) {
    return planet.coordsRevealed === false;
  } else {
    return false;
  }
}

export function RequestRevealButton(props: Props) {
  const [canRequest, setCanRequest] = useState(() => canRequestReveal(props.locationId));

  useEffect(() => {
    setCanRequest(canRequestReveal(props.locationId));
  }, [props.locationId]);

  function onClick() {
    setCanRequest(false);
    // TODO: What to do with these promises?
    requestReveal(props);
  }

  return html`<${Button} style=${fullWidth} onClick=${onClick} enabled=${canRequest}>Request Reveal<//>`;
}
