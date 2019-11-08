import React from "react";

import DeltaRanking from "./deltaRanking";
import { Alert } from "../misc/alert";

export default function Routes() {
  return (
    <div>
      <Alert stateName="rankingNotice">
        <h4 className="mb-2">提示</h4>
        排行榜非实时更新，可能会有数小时的延迟
      </Alert>
      <DeltaRanking />
    </div>
  );
}
