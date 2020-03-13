import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

export const FormRow = ({ title = "", inline = false, children = undefined as ReactNode }) => (
  <div className="form-group row">
    <label className={`col-${inline ? "lg" : "md"}-3 col-form-label`}>
      <Trans ns="formRow">{title}</Trans>
    </label>
    <div className={`col-${inline ? "lg" : "md"}-9 ${inline ? "form-inline" : ""}`}>{children}</div>
  </div>
);
