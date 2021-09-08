import { colors } from "./df";

export const flex = {
  display: "flex",
  justifyContent: "space-between",
};

export const shown = {
  ...flex,
  width: "100%",
  flexDirection: "column",
};

export const hidden = {
  display: "none",
};

// TODO: Not red?
export const beware = {
  color: colors.dfred,
};

export const warning = {
  textAlign: "center",
  marginBottom: "10px",
};

export const muted = {
  color: "#a0a0a0",
};

export const centered = {
  margin: "auto",
};

export const bold = {
  color: colors.dfwhite,
};

export const fullWidth = {
  width: "100%",
};

export const scrollList = {
  display: "flex",
  flexDirection: "column",
  overflow: "scroll",
  height: "200px",
};

export const scrollListItem = {
  ...flex,
  marginBottom: "7px",
  paddingBottom: "7px",
  borderBottom: "1px solid #a0a0a0",
};

export const jumpLink = {
  color: "#00ADE1", // TODO: dfblue
  cursor: "pointer",
};

export const optionsRow = {
  ...flex,
  paddingTop: "6px",
};
