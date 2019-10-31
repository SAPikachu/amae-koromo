import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, LabelList, Curve } from "recharts";

import { PlayerMetadata, RANK_LABELS, RANK_COLORS } from "../../../utils/dataSource";
import { useMemo } from "react";
import { formatPercent } from "../../../utils/index";

const generateCells = (activeIndex: number) =>
  RANK_COLORS.map((color, index) => (
    <Cell fill={color} fillOpacity={activeIndex === index ? 1 : 1} key={`cell-${index}`} />
  ));

const CELLS = generateCells(-1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatLabel = (x: any) => (x.rate > 0 ? x.label : null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLabelLine = (props: any) =>
  props.payload.payload.rate > 0 ? <Curve {...props} type="linear" className="recharts-pie-label-line" /> : null;

export default function RankRateChart({ metadata, aspect = 1 }: { metadata: PlayerMetadata; aspect?: number }) {
  const ranks = useMemo(() => metadata.rank_rates.map((x, index) => ({ label: RANK_LABELS[index], rate: x })), [
    metadata
  ]);
  const startAngle = ranks.filter(x => x.rate > 0).length < 4 ? 45 : 0;
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <PieChart>
        <Pie
          isAnimationActive={false}
          data={ranks}
          label={formatLabel}
          labelLine={createLabelLine}
          nameKey="label"
          dataKey="rate"
          startAngle={startAngle}
          endAngle={startAngle + 360}
        >
          {CELLS}
          <LabelList dataKey="rate" formatter={formatPercent} position="inside" fill="#fff" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
