import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

export const FormRow = ({ title = "", inline = false, children = undefined as ReactNode }) => (
  <>
    <label className={"col-form-label"}>
      <Trans ns="formRow">{title}</Trans>
    </label>
    <div className={`col-form-control ${inline ? "form-inline" : ""}`}>{children}</div>
  </>
);
