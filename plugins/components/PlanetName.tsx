import type { LocationId } from "@darkforest_eth/types";

import { h, FunctionComponent } from "preact";

import { centerCoords, getCoordsByLocationId, planetName } from "../helpers/df";
import { bold, jumpLink } from "../helpers/styles";

type Props = {
  locationId: LocationId;
};

export const PlanetName: FunctionComponent<Props> = ({ locationId }) => {
  const coords = getCoordsByLocationId(locationId);

  function centerPlanet() {
    if (coords) {
      centerCoords(coords);
    }
  }

  if (coords) {
    return (
      <span style={jumpLink} onClick={centerPlanet}>
        {planetName(locationId)} ({coords.x}, {coords.y})
      </span>
    );
  } else {
    return <span style={bold}>{planetName(locationId)}</span>;
  }
};
