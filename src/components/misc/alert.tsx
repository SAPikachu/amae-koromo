import { useState, useEffect } from "react";
import React from "react";
import { ReactComponentLike } from "prop-types";

export function Alert({ className = "", type = "info", container = React.Fragment as ReactComponentLike, stateName = "", children }) {
  const stateKey = `alertState_${stateName}`;
  const [closed, setClosed] = useState(() => stateName && !!localStorage.getItem(stateKey));
  useEffect(() => {
    if (stateName && closed) {
      localStorage.setItem(stateKey, "true");
    }
  }, [closed, stateName, stateKey]);
  if (closed) {
    return null;
  }
  const Cont = container;
  return (
    <Cont>
      <div className={`alert alert-${type} alert-dismissible fade show ${className}`} role="alert">
        {children}
        <button
          type="button"
          className="close"
          data-dismiss="alert"
          aria-label="Close"
          onClick={event => {
            event.preventDefault();
            setClosed(true);
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </Cont>
  );
}
