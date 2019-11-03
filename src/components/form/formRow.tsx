import React, { ReactNode } from "react";

export const FormRow = ({ title = "", inline = false, children = undefined as ReactNode }) => (
  <div className="form-group row">
    <label className={`col-${inline ? "lg" : "md"}-2 col-form-label`}>{title}</label>
    <div className={`col-${inline ? "lg" : "md"}-10 ${inline ? "form-inline" : ""}`}>{children}</div>
  </div>
);
