import type { BroadcastMarket } from "../../types";
import type { LocationId } from "@darkforest_eth/types";

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useQuery, gql } from "@apollo/client";

import { planetName } from "../helpers/df";
import { RevealRequest, Constants, StatusMessage } from "../helpers/other";
import type { PlanetsByPlayer, PlanetsByPlayerVariables } from "../generated/PlanetsByPlayer";

const flex = {
  display: "flex",
};

const messageBar = {
  ...flex,
  marginTop: "8px",
};

const shownStatusMessage = {
  height: "24px",
  margin: "auto",
};

const hiddenStatusMessage = {
  ...shownStatusMessage,
  visibility: "hidden",
};

type Props = {
  contract: BroadcastMarket;
  requests: Map<LocationId, RevealRequest>;
  constants: Constants;
};

const PLANETS_BY_PLAYER = gql`
  query PlanetsByPlayer($owner: String!, $skip: Int!, $first: Int!) {
    planets(skip: $skip, first: $first, where: { owner: $owner }, orderBy: planetLevel, orderDirection: desc) {
      id
      planetLevel
    }
  }
`;

export function AppView({ contract, requests, constants }: Props) {
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    let handle: ReturnType<typeof setTimeout>;
    if (statusMessage?.timeout) {
      handle = setTimeout(() => setStatusMessage(null), statusMessage.timeout);
    }

    return () => {
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, [statusMessage]);

  const { loading, data, fetchMore } = useQuery<PlanetsByPlayer, PlanetsByPlayerVariables>(PLANETS_BY_PLAYER, {
    variables: {
      owner: "0xe0a0a42dE89C695CFfEe76C50C3Da710BB22C112".toLowerCase(),
      skip: 0,
      first: 10,
    },
  });

  function loadMore() {
    fetchMore<PlanetsByPlayer, PlanetsByPlayerVariables, "skip">({
      variables: { skip: data.planets.length },
    });
  }

  return (
    <div>
      {loading ? "Loading data" : null}
      {data ? (
        <table>
          <tr>
            <th>Name</th>
            <th>Level</th>
          </tr>
          {data.planets.map((planet) => (
            <tr key={planet.id}>
              <td>{planetName(planet.id as LocationId)}</td>
              <td>{planet.planetLevel}</td>
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={loadMore}>Load more...</button>
            </td>
          </tr>
        </table>
      ) : null}

      <div style={messageBar}>
        <span style={statusMessage ? { ...shownStatusMessage, color: statusMessage.color } : hiddenStatusMessage}>
          {statusMessage?.message}
        </span>
      </div>
    </div>
  );
}
