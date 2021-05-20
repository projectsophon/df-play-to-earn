import type { RevealMarket } from "../../types";
import type { Awaited, EthAddress, LocationId } from "@darkforest_eth/types";

//@ts-expect-error
import bigInt from "big-integer";
import { LOCATION_ID_UB } from "@darkforest_eth/constants";
import { parseEther, formatEther } from "@ethersproject/units";
import { locationIdFromDecStr, address } from "@darkforest_eth/serde";

import { getContract, getPlanetByLocationId, revealSnarkArgs } from "./df";

export type RawRevealRequest = Awaited<ReturnType<RevealMarket["getRevealRequest"]>>;

export type RevealRequest = {
  requester: EthAddress;
  location: LocationId;
  x: number;
  y: number;
  value: string;
  paid: boolean;
};

export function sortByValue(revealRequests: RevealRequest[]) {
  return revealRequests.sort((a, b) => {
    const aValue = parseEther(a.value);
    const bValue = parseEther(b.value);
    return bValue.sub(aValue).toNumber();
  });
}

export function decodeRevealRequest(raw: RawRevealRequest) {
  // Stolen from @darkforest_eth/serde `decodeRevealedCoords`
  let xBI = bigInt(raw.x.toString()); // nonnegative residue mod p
  let yBI = bigInt(raw.y.toString()); // nonnegative residue mod p
  let x = 0;
  let y = 0;
  if (xBI.gt(LOCATION_ID_UB.divide(2))) {
    xBI = xBI.minus(LOCATION_ID_UB);
  }
  x = xBI.toJSNumber();
  if (yBI.gt(LOCATION_ID_UB.divide(2))) {
    yBI = yBI.minus(LOCATION_ID_UB);
  }
  y = yBI.toJSNumber();

  return {
    requester: address(raw.requester),
    location: locationIdFromDecStr(raw.location.toString()),
    x: x,
    y: y,
    value: formatEther(raw.value.toString()),
    paid: raw.paid,
  };
}

export async function getRevealRequests(contract: RevealMarket): Promise<RevealRequest[]> {
  try {
    const rawRevealRequests = await contract.getAllRevealRequests();
    const revealRequests = rawRevealRequests.map(decodeRevealRequest);
    return revealRequests;
  } catch (err) {
    // TODO: Handle error better
    console.error("unable to get reveal requests", err);
    return [];
  }
}

export async function requestReveal(locationId: LocationId, xdai: string): Promise<void> {
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
    const contract = await getContract();
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
