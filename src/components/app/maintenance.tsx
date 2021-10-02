import * as React from "react";
import { useState } from "react";

import { Alert } from "../misc/alert";
import { Container } from "../layout/container";
import { setMaintenanceHandler } from "../../data/source/api";

export function MaintenanceHandler({ children }: { children: React.ReactElement }): React.ReactElement {
  const [msg, setMsg] = useState("");
  setMaintenanceHandler(setMsg);
  if (!msg) {
    return children;
  }
  return (
    <Alert container={Container} closable={false} title="临时维护公告">
      {msg}
    </Alert>
  );
}
