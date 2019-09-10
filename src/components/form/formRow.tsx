import React from "react";

export const FormRow = ({ title = "", children }) => (
  <div className="form-group row">
    <label className="col-sm-2 col-form-label">{title}</label>
    <div className="col-sm-10">{children}</div>
  </div>
);
