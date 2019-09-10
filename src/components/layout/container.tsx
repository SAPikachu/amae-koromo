import React, { ReactNode } from "react";

export const Container = ({ title = undefined, children = undefined as ReactNode, fluid = false }) => (
  <div className={`my-5 container${fluid ? "-fluid" : ""}`}>
    <div className="row">
      <div className="col-sm-12">
        {title && <h2 className="mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  </div>
);
