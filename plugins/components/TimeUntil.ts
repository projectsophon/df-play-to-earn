import { html } from "htm/preact";

type Props = {
  timestamp: number;
  ifPassed: string;
};

// Stolen from DF client
export function TimeUntil({ timestamp, ifPassed }: Props) {
  if (timestamp <= 0) {
    return html`<span>${ifPassed}</span>`;
  } else {
    const hoursWait = Math.floor(timestamp / 1000 / 60 / 60);
    const minutes = Math.floor((timestamp - hoursWait * 60 * 60 * 1000) / 1000 / 60);
    const seconds = Math.floor((timestamp - hoursWait * 60 * 60 * 1000 - minutes * 60 * 1000) / 1000);
    const str = hoursWait + ":" + (minutes + "").padStart(2, "0") + ":" + (seconds + "").padStart(2, "0");
    return html`<span>${str}</span>`;
  }
}
