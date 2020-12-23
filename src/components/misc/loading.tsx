import React from "react";

export default function Loading({
  size = "normal",
  className = "",
}: {
  className?: string;
  size?: "normal" | "small";
}) {
  return (
    <div className={`spinner-container d-flex justify-content-center m-${size === "normal" ? 5 : 1} ${className}`}>
      <div className={`spinner-border ${size === "normal" ? "" : "spinner-border-sm"}`} role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
