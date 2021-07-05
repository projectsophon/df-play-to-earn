/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PlanetsByPlayer
// ====================================================

export interface PlanetsByPlayer_planets {
  __typename: "Planet";
  /**
   * locationId: 0 padded hex value of locationDec, no 0x prefix
   */
  id: string;
  planetLevel: number;
}

export interface PlanetsByPlayer {
  planets: PlanetsByPlayer_planets[];
}

export interface PlanetsByPlayerVariables {
  owner: string;
  skip: number;
  first: number;
}
