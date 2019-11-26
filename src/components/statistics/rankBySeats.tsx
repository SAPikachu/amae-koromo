import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, LabelList, LabelProps, PolarViewBox } from "recharts";
import { useAsyncFactory } from "../../utils/index";
import { getRankRateBySeat } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useMemo } from "react";
import { useModel } from "../modeModel";

const SEAT_LABELS = "东南西北";
const SEAT_COLORS = ["#003f5c", "#7a5195", "#ef5675", "#ffa600"];

const generateCells = (activeIndex: number) =>
  SEAT_COLORS.map((color, index) => (
    <Cell fill={color} fillOpacity={activeIndex === index ? 1 : 1} key={`cell-${index}`} />
  ));

const CELLS = generateCells(-1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatLabel = (x: any) => (x.rate > 0 ? x.label : null);

const getDeltaAngle = (startAngle: number, endAngle: number) => {
  const sign = Math.sign(endAngle - startAngle);
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);

  return sign * deltaAngle;
};

export const RADIAN = Math.PI / 180;

export const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius
});

const renderCustomizedLabel = (props: LabelProps) => {
  let { value } = props;
  if (!value) {
    return null;
  }
  value = value.toString();
  const { cx, cy, outerRadius, startAngle, endAngle } = props.viewBox as Required<PolarViewBox>;
  const labelAngle = startAngle + getDeltaAngle(startAngle, endAngle) / 2;
  const { x, y } = polarToCartesian(cx, cy, outerRadius / 2, labelAngle);
  return (
    <g>
      <text x={x} y={y - 12} stroke="#fff" strokeWidth="0.5" fill="#fff" textAnchor="middle" dominantBaseline="central">
        {value.split("\n")[0]}
      </text>
      <text x={x} y={y + 12} stroke="#fff" strokeWidth="0.5" fill="#fff" textAnchor="middle" dominantBaseline="central">
        {value.split("\n")[1]}
      </text>
    </g>
  );
};

function Chart({
  rates,
  numGames,
  aspect = 1
}: {
  rates: [number, number, number, number];
  numGames: number;
  aspect?: number;
}) {
  const items = useMemo(
    () =>
      rates.map((x, index) => ({
        rate: x,
        count: Math.round(x * numGames),
        label: SEAT_LABELS[index],
        pieLabel: `${(x * 100).toFixed(2)}%\n[${Math.round(x * numGames)}]`
      })),
    [rates, numGames]
  );
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <PieChart>
        <Pie isAnimationActive={false} data={items} nameKey="label" dataKey="rate" label={formatLabel}>
          {CELLS}
          <LabelList dataKey="pieLabel" position="inside" fill="#fff" content={renderCustomizedLabel} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function RankBySeats() {
  const data = useAsyncFactory(getRankRateBySeat, []);
  const [model] = useModel();
  if (!data) {
    return <Loading />;
  }
  const selectedData = data[model.selectedMode || "0"];
  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          <h3 className="text-center">坐席吃一率</h3>
          <Chart rates={selectedData[1]} numGames={selectedData.numGames} />
        </div>
        <div className="col-lg-6">
          <h3 className="text-center">坐席吃四率</h3>
          <Chart rates={selectedData[4]} numGames={selectedData.numGames} />
        </div>
      </div>
      <div className="row">
        <div className="col text-right">统计半庄数：{selectedData.numGames}</div>
      </div>
    </>
  );
}
