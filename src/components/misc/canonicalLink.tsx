import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router";
import Conf from "../../utils/conf";

export default function CanonicalLink() {
  const loc = useLocation();
  return (
    <Helmet>
      <link rel="canonical" href={`https://${Conf.canonicalDomain}${loc.pathname}`} />
    </Helmet>
  );
}
