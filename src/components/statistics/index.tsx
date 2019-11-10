import React from "react";
import RankBySeats from "./rankBySeats";
import { Helmet } from "react-helmet";

export default function Routes() {
  return (
    <div>
      <Helmet>
        <title>大数据</title>
      </Helmet>
      <RankBySeats />
    </div>
  );
}
