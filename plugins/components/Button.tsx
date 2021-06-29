import { h, FunctionComponent } from "preact";

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
};

export const Button: FunctionComponent<Props> = ({ enabled, onClick, children }) => {
  const style = enabled ? styles.enabled : styles.disabled;

  return (
    <button style={style} onClick={onClick} disabled={!enabled}>
      {children}
    </button>
  );
};
