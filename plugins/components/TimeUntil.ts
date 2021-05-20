import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

type Props = {
  timestamp: number;
  ifPassed: string;
  onAvailable: () => void;
};

// Stolen from DF client
export function TimeUntil({ timestamp, ifPassed, onAvailable }: Props) {
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
  }, [timestamp, ifPassed, onAvailable]);

  return html`<span>${value}</span>`;
}
