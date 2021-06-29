import { h, FunctionComponent } from "preact";
import { useState } from "preact/hooks";

const viewLink = {
  marginBottom: "10px",
  cursor: "pointer",
  color: "#a0a0a0",
  textDecoration: "underline",
  padding: "4px 8px",
  borderRadius: "2px",
  width: "33%",
  textAlign: "center",
};

const viewLinkActive = {
  ...viewLink,
  color: "#080808",
  backgroundColor: "#00DC82",
};

const viewLinkInactive = {
  ...viewLink,
};

type Props = {
  active: boolean;
  text: string;
  onClick: () => void;
};

export const ViewLink: FunctionComponent<Props> = ({ active, text, onClick }) => {
  const [hovering, setHovering] = useState(false);

  const baseStyle = active ? viewLinkActive : viewLinkInactive;
  const style = hovering ? { backgroundColor: "#282834", ...baseStyle, color: "#ffffff" } : baseStyle;

  return (
    <div style={style} onClick={onClick} onMouseOver={() => setHovering(true)} onMouseOut={() => setHovering(false)}>
      {text}
    </div>
  );
};
