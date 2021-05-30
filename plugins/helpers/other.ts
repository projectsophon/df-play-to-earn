import type { RevealMarket } from "../../types";
import type { Awaited, EthAddress, LocationId } from "@darkforest_eth/types";

//@ts-expect-error
import bigInt from "big-integer";
import { LOCATION_ID_UB } from "@darkforest_eth/constants";
import { parseEther, formatEther } from "@ethersproject/units";
import { FixedNumber } from "@ethersproject/bignumber";
import { locationIdFromDecStr, address } from "@darkforest_eth/serde";
//@ts-ignore
import { default as stableSort } from "stable";

import { getContract, getPlanetByLocationId, revealSnarkArgs } from "./df";

export type RawRevealRequest = Awaited<ReturnType<RevealMarket["getRevealRequest"]>>;
export type RawConstants = Awaited<ReturnType<RevealMarket["getConstants"]>>;

export type RevealRequest = {
  requester: EthAddress;
  collector: EthAddress;
  location: LocationId;
  x: number;
  y: number;
  payout: string;
  paid: boolean;
  refunded: boolean;
  cancelCompleteBlock: number;
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
  contract: RevealMarket;
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
    return bValue.gt(aValue) ? 0 : -1;
  });
}

export function decodeRevealRequest(raw: RawRevealRequest): RevealRequest {
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
    collector: address(raw.collector),
    location: locationIdFromDecStr(raw.location.toString()),
    x: x,
    y: y,
    payout: formatEther(raw.payout.toString()),
    paid: raw.paid,
    refunded: raw.refunded,
    cancelCompleteBlock: raw.cancelCompleteBlock.toNumber(),
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

export async function getRevealRequests(contract: RevealMarket): Promise<Map<LocationId, RevealRequest>> {
  try {
    const rawRevealRequests = await contract.getAllRevealRequests();
    const revealRequests = rawRevealRequests.map((raw) => {
      const req = decodeRevealRequest(raw);
      return [req.location, req] as [LocationId, RevealRequest];
    });
    return new Map(revealRequests);
  } catch (err) {
    throw new Error("Unable to load reveal requests. Please reload.");
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
      console.error("Error submitting request", subErr2.message);
    } else {
      console.error("Error submitting request", err);
    }
    throw new Error("Error submitting request. See console for details.");
  }
}

export function totalFromEther(amount: string, feePercent: number): string {
  const amountFixed = FixedNumber.from(amount);
  const payPercentFixed = FixedNumber.from(100 - feePercent);
  const totalFixed = FixedNumber.from(100).divUnsafe(payPercentFixed).mulUnsafe(amountFixed);
  return totalFixed.toString();
}

export function feeFromEther(total: string, feePercent: number): string {
  const fee = parseEther(total).mul(feePercent).div(100);
  return formatEther(fee);
}

export function minWithoutFee(minAmount: string, feePercent: number): string {
  const min = parseEther(minAmount);
  const fee = min.mul(feePercent).div(100);
  const payment = min.sub(fee);
  return formatEther(payment);
}
