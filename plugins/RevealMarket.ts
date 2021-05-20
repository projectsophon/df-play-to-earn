//@ts-nocheck Because the DF globals aren't shipped as a package
import type { RevealMarket } from "../types";
import { html, render, useState, useEffect } from "https://cdn.skypack.dev/htm@latest/preact/standalone.module.js";
import { locationIdFromDecStr, locationIdToDecStr } from "@darkforest_eth/serde";
import { LocationId } from "@darkforest_eth/types";
import { LOCATION_ID_UB } from "@darkforest_eth/constants";
import { parseEther, formatEther } from "https://cdn.skypack.dev/@ethersproject/units";
import bigInt from "https://cdn.skypack.dev/big-integer";

import contractABI from "./RevealMarketABI";

const contractAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";

const { LOCATION_REVEAL_COOLDOWN } = ui.getContractConstants();

const revealCooldown = Math.floor(LOCATION_REVEAL_COOLDOWN / 60 / 60);

const { getPlanetName } = df.getProcgenUtils();

const fullWidth = {
  width: "100%",
};

const flex = {
  display: "flex",
  justifyContent: "space-between",
};

const flexColumn = {
  ...flex,
  flexDirection: "column",
};

const flexBottom = {
  ...flexColumn,
  flex: ".66 0",
  justifyContent: "flex-end",
};

const paymentInput = {
  color: "#080808",
  padding: "0 5px",
  width: "100px",
  marginRight: "5px",
};

const viewWrapper = {
  height: "250px",
};

const shown = {
  ...fullWidth,
  ...flexColumn,
};

const hidden = {
  display: "none",
};

const viewLink = {
  marginBottom: "10px",
  cursor: "pointer",
};

const viewLinkActive = {
  ...viewLink,
  background: "#4a4a5a",
  border: "1px solid #a0a0a0",
  borderRadius: "3px",
  padding: "0 5px",
};

const viewLinkInactive = {
  ...viewLink,
};

const planetLink = {
  color: "#00ADE1",
  cursor: "pointer",
};

const bold = {
  color: "white",
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
  overflow: "scroll",
  height: "200px",
};
const revealWarning = {
  textAlign: "center",
  height: "50px",
};

function planetName(locationId: string) {
  if (locationId) {
    // Fake a planet
    return getPlanetName({ locationId });
  } else {
    return "No planet selected";
  }
}

function playerName(address: string) {
  if (address) {
    const twitter = df.getTwitter(address);
    if (twitter) {
      return twitter;
    } else {
      return address.substring(0, 6);
    }
  }

  return "Unknown";
}

async function getContract(): Promise<RevealMarket> {
  return df.loadContract(contractAddress, contractABI);
}

function sortByValue(revealRequests: RevealRequest[]) {
  return revealRequests.sort((a, b) => {
    const aValue = parseEther(a.value);
    const bValue = parseEther(b.value);
    return bValue.sub(aValue);
  });
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
type RawRevealRequest = Awaited<ReturnType<RevealMarket["getRevealRequest"]>>;

type RevealRequest = {
  requester: string;
  location: LocationId;
  x: number;
  y: number;
  value: string;
  paid: boolean;
};

// Re-implemented because DF code is too complicated
async function dfRevealLocation(x, y) {
  try {
    const snarkArgs = await df.snarkHelper.getRevealArgs(x, y);
    // I feel like there's a bug in this
    await df.contractsAPI.coreContract.revealLocation(...snarkArgs);
  } catch (err) {
    console.log(err);
  }
}

function decodeRevealRequest(raw: RawRevealRequest) {
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
    requester: raw.requester,
    location: locationIdFromDecStr(raw.location.toString()),
    x: x,
    y: y,
    value: formatEther(raw.value.toString()),
    paid: raw.paid,
  };
}

async function getRevealRequests(contract: RevealMarket) {
  try {
    const rawRevealRequests = await contract.getAllRevealRequests();
    const revealRequests = rawRevealRequests.map(decodeRevealRequest);
    return revealRequests;
  } catch (err) {
    console.error("unable to get reveal requests", err);
    return [];
  }
}

// Stolen from DF client
function TimeUntil({
  timestamp,
  ifPassed,
  onAvailable,
}: {
  timestamp: number;
  ifPassed: string;
  onAvailable: () => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const update = () => {
      const msWait = timestamp - Date.now();

      if (msWait <= 0) {
        setValue(ifPassed);
        onAvailable();
      } else {
        const hoursWait = Math.floor(msWait / 1000 / 60 / 60);
        const minutes = Math.floor((msWait - hoursWait * 60 * 60 * 1000) / 1000 / 60);
        const seconds = Math.floor((msWait - hoursWait * 60 * 60 * 1000 - minutes * 60 * 1000) / 1000);
        const str = hoursWait + ":" + (minutes + "").padStart(2, "0") + ":" + (seconds + "").padStart(2, "0");
        setValue(str);
      }
    };

    const interval = setInterval(update, 1000);

    update();
    return () => clearInterval(interval);
  }, [timestamp, ifPassed]);

  return html`<span>${value}</span>`;
}

function RequestRevealButton({ locationId, xdai }) {
  async function requestReveal() {
    console.log("request reveal", locationId);
    const planet = df.getPlanetWithId(locationId);
    if (!planet) {
      console.log("no planet");
      return;
    }
    if (planet.coordsRevealed) {
      console.log("already revealed");
      return;
    }
    if (!planet?.location?.coords) {
      console.log("Don't know the location");
      return;
    }

    const { x, y } = planet.location.coords;
    const contract = await getContract();
    const snarkArgs = await df.snarkHelper.getRevealArgs(x, y);
    const receipt = await contract.requestReveal(...snarkArgs, {
      value: parseEther(xdai),
    });
    await receipt.wait();
    console.log("RevealRequest posted");
  }

  return html`<button style=${fullWidth} onClick=${requestReveal} disabled=${!locationId}>Request Reveal</button>`;
}

function RequestRevealView({ active }) {
  const [selectedPlanetId, setSelectedPlanetId] = useState(() => {
    const planet = ui.getSelectedPlanet();
    return planet?.locationId;
  });
  const [balance, setBalance] = useState(() => {
    return df.getMyBalance();
  });

  useEffect(() => {
    const sub = ui.selectedPlanetId$.subscribe((id) => {
      console.log("set id", id);
      setSelectedPlanetId(id);
    });
    return sub.unsubscribe;
  }, [setSelectedPlanetId]);

  useEffect(() => {
    const sub = df.myBalance$.subscribe((balance) => {
      console.log("my balance", balance);
      setBalance(balance);
    });
    return sub.unsubscribe;
  }, [setBalance]);

  const [xdai, setXdai] = useState("1.0");
  const [minXdai, setMinXdai] = useState("1.0");

  function onChangeXdai(evt) {
    setXdai(evt.target.value);
  }

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${flex}>
        <span>Request Reveal of:</span>
        <span>${planetName(selectedPlanetId)}</span>
      </div>
      <div style=${flex}>
        <span>Paying:</span>
        <span>
          <input type="number" style=${paymentInput} value=${xdai} min=${minXdai} onChange=${onChangeXdai} step="0.1" />
          <label>xDai</label>
        </span>
      </div>
      <div style=${flex}>
        <span>Your xDai Balance:</span>
        <span>${balance} xDai</span>
      </div>
      <div style=${flexBottom}>
        <${RequestRevealButton} locationId=${selectedPlanetId} xdai=${xdai} />
      </div>
    </div>
  `;
}

function Button({ enabled, onClick, children }) {
  const style = enabled
    ? {}
    : {
        backgroundColor: "#a0a0a0",
        color: "#080808",
        border: "1px solid #080808",
        outline: "none",
      };

  return html`<button style=${style} onClick=${onClick} disabled=${!enabled}>${children}</button>`;
}

function FulfillRequestsView({ active, contract }: { active: boolean; contract: RevealMarket }) {
  const [nextReveal, setNextReveal] = useState(() => ui.getNextBroadcastAvailableTimestamp());
  const [revealRequests, setRevealRequests]: [RevealRequest[], (_: RevealRequest[]) => void] = useState([]);
  const [canReveal, setCanReveal] = useState(() => nextReveal <= Date.now());

  useEffect(() => {
    getRevealRequests(contract).then((requests) => {
      console.log("reveal requests", requests);
      setRevealRequests(sortByValue(requests));
    });
  }, []);

  useEffect(() => {
    function onRevealRequested(requester, location, x, y, value) {
      const raw = { requester, location, x, y, value, paid: false };
      const newRequest = decodeRevealRequest(raw);
      setRevealRequests((requests) => sortByValue(requests.concat(newRequest)));
    }

    contract.on("RevealRequested", onRevealRequested);

    return () => {
      contract.off("RevealRequested", onRevealRequested);
    };
  }, []);

  useEffect(() => {
    function onRevealCollected(_collector, location, _x, _y, _value) {
      const loc = locationIdFromDecStr(location.toString());
      setRevealRequests((requests) => sortByValue(requests.filter((req) => req.location !== loc)));
    }

    contract.on("RevealCollected", onRevealCollected);

    return () => {
      contract.off("RevealCollected", onRevealCollected);
    };
  }, []);

  function onAvailable() {
    setNextReveal(ui.getNextBroadcastAvailableTimestamp());
    setCanReveal(true);
  }

  const rows = revealRequests
    .filter(({ paid }) => !paid)
    .map(({ location, x, y, value, requester }) => {
      function centerPlanet() {
        ui.centerCoords({ x, y });
      }
      async function revealPlanet() {
        setCanReveal(false);
        await dfRevealLocation(x, y);
        await contract.claimReveal(locationIdToDecStr(location));
        // TODO: When does the player get updated?
        setNextReveal(ui.getNextBroadcastAvailableTimestamp());
      }
      return html`
        <div style=${revealRequestRow} key=${location}>
          <div style=${muted}>
            <div>
              Reveal <span style=${planetLink} onClick=${centerPlanet}>${planetName(location)} (${x}, ${y})</span>
            </div>
            <div>and receive <span style=${bold}>${value} xDai</span> from ${playerName(requester)}</div>
          </div>
          <${Button} onClick=${revealPlanet} enabled=${canReveal}>Reveal<//>
        </div>
      `;
    });

  return html`
    <div style=${active ? shown : hidden}>
      <div style=${revealWarning}>
        <div><span style=${beware}>Beware:</span> You can only reveal once every ${revealCooldown} hours</div>
        <div>Time until your next reveal: <${TimeUntil} timestamp=${nextReveal} ifPassed=${"Now!"} onAvailable=${onAvailable} /></div>
      </div>
      <div style=${revealRequestsList}>${rows}</div>
    </<div>
  `;
}

function ViewLink({ active, text, onClick }) {
  return html`<div style=${active ? viewLinkActive : viewLinkInactive} onClick=${onClick}>${text}</div>`;
}

enum Views {
  RequestReveal,
  FulfillRequests,
}

function App({ contract }) {
  const [activeView, setActiveView] = useState(Views.FulfillRequests);

  const requestRevealActive = activeView === Views.RequestReveal;
  const fulfillRequestsActive = activeView === Views.FulfillRequests;

  function setRequestRevealActive() {
    setActiveView(Views.RequestReveal);
  }
  function setFulfillRequestsActive() {
    setActiveView(Views.FulfillRequests);
  }

  return html`
    <div>
      <div style=${flex}>
        <${ViewLink} active=${fulfillRequestsActive} text="Fulfill Requests" onClick=${setFulfillRequestsActive} />
        <${ViewLink} active=${requestRevealActive} text="Request a Reveal" onClick=${setRequestRevealActive} />
      </div>
      <div style=${viewWrapper}>
        <${RequestRevealView} active=${requestRevealActive} />
        <${FulfillRequestsView} active=${fulfillRequestsActive} contract=${contract} />
      </div>
    </div>
  `;
}

class RevealMarketPlugin {
  root?: ReturnType<render>;

  container?: HTMLDivElement;

  constructor() {
    this.root = null;
    this.container = null;
  }
  async render(container: HTMLDivElement) {
    const contract = await getContract();

    this.container = container;

    container.style.width = "450px";

    this.root = render(html`<${App} contract=${contract} />`, container);
  }

  destroy() {
    render(null, this.container, this.root);
  }
}

export default RevealMarketPlugin;
