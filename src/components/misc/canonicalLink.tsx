import React from "react";
import { Helmet } from "react-helmet";
import { CANONICAL_DOMAIN } from "../../utils/constants";
import { useLocation } from "react-router";

export default function CanonicalLink() {
  const loc = useLocation();
  return (
    <Helmet>
      <link rel="canonical" href={`https://${CANONICAL_DOMAIN}${loc.pathname}`} />
    </Helmet>
  );
}
