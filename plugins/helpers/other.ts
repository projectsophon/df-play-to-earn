import type { BroadcastMarket } from "../../types";
import type { Awaited, EthAddress, LocationId } from "@darkforest_eth/types";

//@ts-expect-error
import bigInt from "big-integer";
import { LOCATION_ID_UB } from "@darkforest_eth/constants";
import { parseEther, formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { locationIdFromDecStr, address } from "@darkforest_eth/serde";
//@ts-ignore
import { default as stableSort } from "stable";

import { getContract, getPlanetByLocationId, revealSnarkArgs } from "./df";

export type RawRevealRequest = Awaited<ReturnType<BroadcastMarket["getRevealRequest"]>>;
export type RawConstants = Awaited<ReturnType<BroadcastMarket["getConstants"]>>;
export type RawCoords = Awaited<ReturnType<BroadcastMarket["getCoords"]>>;

export type RevealRequest = {
  requester: EthAddress;
  collector: EthAddress;
  location: LocationId;
  payout: string;
  paid: boolean;
  refunded: boolean;
  cancelCompleteBlock: number;
  isKnown: boolean;
};

export type Coords = {
  x: number;
  y: number;
  isSubmitted: boolean;
};

export type Constants = {
  MARKET_CLOSE_COUNTDOWN_TIMESTAMP: Date;
  CANCELLED_COUNTDOWN_BLOCKS: number;
  REQUEST_MINIMUM: string;
  FEE_PERCENT: number;
};

export type StatusMessage = {
  message: string;
  color: string;
  timeout?: number;
};

export type ViewProps = {
  active: boolean;
  contract: BroadcastMarket;
  revealRequests: RevealRequest[];
  constants: Constants;
  onStatus: (status: StatusMessage) => void;
  pending: boolean;
  setPending: (pending: boolean) => void;
};

export function sortByValue(revealRequests: Map<LocationId, RevealRequest>) {
  return stableSort(Array.from(revealRequests.values()), (a: RevealRequest, b: RevealRequest) => {
    const aValue = parseEther(a.payout);
    const bValue = parseEther(b.payout);
    return bValue.gt(aValue);
  });
}

export function decodeCoords(raw: RawCoords): Coords {
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
    x: x,
    y: y,
    isSubmitted: raw.isSubmitted,
  };
}

export function decodeRevealRequest(raw: RawRevealRequest): RevealRequest {
  return {
    requester: address(raw.requester),
    collector: address(raw.collector),
    location: locationIdFromDecStr(raw.location.toString()),
    payout: formatEther(raw.payout.toString()),
    paid: raw.paid,
    refunded: raw.refunded,
    cancelCompleteBlock: raw.cancelCompleteBlock.toNumber(),
    isKnown: raw.isKnown,
  };
}

export function decodeConstants(raw: RawConstants): Constants {
  return {
    // Solidity is in seconds, but JS is in Milliseconds
    MARKET_CLOSE_COUNTDOWN_TIMESTAMP: new Date(raw.MARKET_CLOSE_COUNTDOWN_TIMESTAMP.toNumber() * 1000),
    CANCELLED_COUNTDOWN_BLOCKS: raw.CANCELLED_COUNTDOWN_BLOCKS.toNumber(),
    REQUEST_MINIMUM: formatEther(raw.REQUEST_MINIMUM),
    FEE_PERCENT: raw.FEE_PERCENT,
  };
}

export async function getRevealRequests(contract: BroadcastMarket): Promise<Map<LocationId, RevealRequest>> {
  try {
    const rawRevealRequests = await contract.getAllRevealRequests();
    const revealRequests = rawRevealRequests.map((raw) => {
      const req = decodeRevealRequest(raw);
      return [req.location, req] as [LocationId, RevealRequest];
    });
    return new Map(revealRequests);
  } catch (err) {
    console.log("[BroadcastMarketPlugin] Error getting RevealRequests", err);
    throw new Error("Unable to load broadcast requests. Please reload.");
  }
}

export async function requestReveal(locationId: LocationId, xdai: string): Promise<void> {
  const planet = getPlanetByLocationId(locationId);
  if (!planet) {
    throw new Error("No planet selected.");
  }
  if (planet.coordsRevealed) {
    throw new Error("Planet is already revealed.");
  }
  //@ts-expect-error Because we don't have isLocatable
  if (!planet?.location?.coords) {
    throw new Error("Unable to locate that planet.");
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
  } catch (err) {
    const subErr2 = err?.error?.error;
    if (subErr2) {
      console.error("[BroadcastMarketPlugin] Error submitting request", subErr2.message);
    } else {
      console.error("[BroadcastMarketPlugin] Error submitting request", err);
    }
    throw new Error("Error submitting request. See console for details.");
  }
}

export function sumEtherStrings(amount: string, fee: string): string {
  const totalWei = parseEther(amount).add(parseEther(fee));
  return formatEther(totalWei);
}

export function feeFromEther(total: string, feePercent: number): string {
  const feeWei = parseEther(total).mul(BigNumber.from(feePercent)).div(BigNumber.from(100));
  return formatEther(feeWei);
}

export function minWithoutFee(minAmount: string, feePercent: number): string {
  const payoutWei = parseEther(minAmount)
    .mul(100)
    .div(BigNumber.from(100 + feePercent));

  return formatEther(payoutWei);
}
