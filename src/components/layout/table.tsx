import React from "react";

import { ReactNode } from "react";

export function Table({ headers, children }: { headers: string | string[]; children?: ReactNode }) {
  if (typeof headers === "string") {
    headers = headers.split(",");
  }
  return (
    <table className="table table-striped">
      {headers && (
        <thead className="text-nowrap">
          <tr>
            {headers.map(x => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </table>
  );
}
