import { html } from "htm/preact";

const styles = {
  enabled: {},
  disabled: {
    backgroundColor: "#a0a0a0",
    color: "#080808",
    border: "1px solid #080808",
    outline: "none",
  },
};

type Props = {
  enabled: boolean;
  onClick: () => void;
  children: unknown;
};

export function Button({ enabled, onClick, children }: Props) {
  const style = enabled ? styles.enabled : styles.disabled;

  return html`<button style=${style} onClick=${onClick} disabled=${!enabled}>${children}</button>`;
}
