import { html } from "htm/preact";

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

type Props = {
  active: boolean;
  text: string;
  onClick: () => void;
};

export function ViewLink({ active, text, onClick }: Props) {
  return html`<div style=${active ? viewLinkActive : viewLinkInactive} onClick=${onClick}>${text}</div>`;
}
