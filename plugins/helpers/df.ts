// This file solely exists for @ts-expect-error because DF doesn't provide the global object as types
import type { Planet, LocationId, EthAddress, WorldCoords } from "@darkforest_eth/types";
import type { RevealSnarkContractCallArgs } from "@darkforest_eth/snarks";
import type { RevealMarket } from "../../types";

import { REVEAL_MARKET_ABI } from "../generated/abi";
import { REVEAL_MARKET_ADDRESS } from "../generated/contract";
import { EMPTY_LOCATION_ID } from "@darkforest_eth/constants";

//@ts-expect-error
const { LOCATION_REVEAL_COOLDOWN }: { LOCATION_REVEAL_COOLDOWN: number } = ui.getContractConstants();

export const REVEAL_COOLDOWN_HOURS = Math.floor(LOCATION_REVEAL_COOLDOWN / 60 / 60);

// Why aren't these available!?
export const colors = {
  dfwhite: "#ffffff",
  dfred: "#FF6492",
  dfgreen: "#00DC82",
};

//@ts-expect-error
const { getPlanetName }: { getPlanetName(planet?: Planet): string } = df.getProcgenUtils();

export function planetName(locationId?: LocationId): string {
  if (locationId) {
    // Fake a planet
    return getPlanetName({ locationId } as Planet);
  } else {
    return "No planet selected";
  }
}

export function playerName(address?: EthAddress): string {
  if (address) {
    //@ts-expect-error
    const twitter = df.getTwitter(address);
    if (twitter) {
      return twitter;
    } else {
      return address.substring(0, 6);
    }
  }

  return "Unknown";
}

export function getAccount(): string {
  //@ts-expect-error
  return df.account;
}

export async function getContract(): Promise<RevealMarket> {
  //@ts-expect-error
  return df.loadContract(REVEAL_MARKET_ADDRESS, REVEAL_MARKET_ABI) as Promise<RevealMarket>;
}

export async function revealLocation(x: number, y: number): Promise<void> {
  const coords = { x, y };
  const planet = getPlanetByCoords(coords);
  if (planet?.coordsRevealed) {
    // TODO: Once revealer is exposed in the client, we need to check if the player is the revealer
    // otherwise they will pay the gas for a claim of someone else.
    return Promise.resolve();
  }
  //@ts-expect-error
  const location = df.locationFromCoords(coords);
  //@ts-expect-error
  df.entityStore.addPlanetLocation(location);
  //@ts-expect-error
  df.revealLocation(location.hash);

  // This is terrible, but we need to do it because DF doesn't give us an await on the function
  return new Promise((resolve, reject) => {
    const handle = setInterval(() => {
      if (!isCurrentlyRevealing()) {
        clearInterval(handle);
        resolve();
      }
    }, 1000);
  });
}

export function getSelectedLocationId(): LocationId {
  //@ts-expect-error
  const planet = ui.getSelectedPlanet();
  return planet?.locationId || EMPTY_LOCATION_ID;
}

export function getMyBalance(): number {
  //@ts-expect-error
  return df.getMyBalance();
}

export type Subscription = {
  unsubscribe(): void;
};

export function subscribeToSelectedLocationId(cb: (loc: LocationId) => void): Subscription {
  //@ts-expect-error
  return ui.selectedPlanetId$.subscribe(cb);
}

export function subscribeToMyBalance(cb: (balance: number) => void): Subscription {
  //@ts-expect-error
  return df.myBalance$.subscribe(cb);
}

export function subscribeToBlockNumber(cb: (blockNumber: number) => void): Subscription {
  //@ts-expect-error
  return df.ethConnection.blockNumber$.subscribe(cb);
}

export function getNextBroadcastAvailableTimestamp(): number {
  //@ts-expect-error
  return ui.getNextBroadcastAvailableTimestamp();
}

export function isCurrentlyRevealing(): boolean {
  //@ts-expect-error
  return ui.isCurrentlyRevealing();
}

export function centerCoords(coords: WorldCoords): void {
  //@ts-expect-error
  ui.centerCoords(coords);
}

export function getPlanetByLocationId(locationId?: LocationId): Planet | undefined {
  //@ts-expect-error
  return df.getPlanetWithId(locationId);
}

export function getPlanetByCoords(coords: WorldCoords): Planet | undefined {
  //@ts-expect-error
  return df.getPlanetWithCoords(coords);
}

export async function revealSnarkArgs(x: number, y: number): Promise<RevealSnarkContractCallArgs> {
  //@ts-expect-error
  return df.snarkHelper.getRevealArgs(x, y);
}

export function getBlockNumber(): number {
  //@ts-expect-error
  return df.ethConnection.blockNumber;
}
