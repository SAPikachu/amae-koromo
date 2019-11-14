import React from "react";

export default function StatItem({ label, description, className = "", children }: {
  label: string;
  description?: string;
  className?: string;
  children: React.ReactChild;
}) {
  return (<>
    <dt className={`col-2 col-lg-1 text-nowrap ${className}`}>{label}</dt>
    <dd className={`col-4 col-lg-3 text-right ${className}`} data-tip={description || ""}>
      {children}
    </dd>
  </>);
}
