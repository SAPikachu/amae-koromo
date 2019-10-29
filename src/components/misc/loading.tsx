import React from "react";

export default function Loading({ size = "normal" }: { size?: "normal" | "small" }) {
  return (
    <div className={`d-flex justify-content-center m-${size === "normal" ? 5 : 1}`}>
      <div className={`spinner-border ${size === "normal" ? "" : "spinner-border-sm"}`} role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
