import { useState, useEffect, ReactNode } from "react";
import React from "react";
import { ReactComponentLike } from "prop-types";
import { triggerRelayout } from "../../utils/index";
import { Alert as MuiAlert, AlertColor, AlertTitle, Fade, AlertProps } from "@mui/material";
import { loadPreference, savePreference } from "../../utils/preference";

export function Alert({
  type = "info" as AlertColor,
  container = React.Fragment as ReactComponentLike,
  stateName = "",
  closable = true,
  title = "",
  children = undefined as ReactNode,
  sx = { mb: 2 } as AlertProps["sx"],
}) {
  const stateKey = `alertState_${stateName}`;
  const [closed, setClosed] = useState(() => stateName && loadPreference(stateKey, false));
  useEffect(() => {
    if (stateName && closed) {
      savePreference(stateKey, true);
    }
  }, [closed, stateName, stateKey]);
  if (closed && closable) {
    return null;
  }
  const Cont = container;
  return (
    <Cont>
      <Fade in={!closed} onEntering={() => triggerRelayout()} onExited={() => triggerRelayout()}>
        <MuiAlert
          severity={type}
          onClose={closable ? () => setClosed(true) : undefined}
          sx={{ "& .MuiAlert-message": { overflow: "unset" }, ...sx }}
        >
          {title && <AlertTitle>{title} </AlertTitle>}
          {children}
        </MuiAlert>
      </Fade>
    </Cont>
  );
}
