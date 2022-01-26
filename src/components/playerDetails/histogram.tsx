import { Box, Typography, useTheme } from "@mui/material";
import React, { SVGAttributes } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getGlobalHistogram } from "../../data/source/misc";

import { GameMode, HistogramData, HistogramGroup, modeLabelNonTranslated, PlayerExtendedStats } from "../../data/types";
import { formatPercent, sum, useAsyncFactory } from "../../utils";
import { useModel } from "../gameRecords/model";

const VIEWBOX_HEIGHT = 40;

function generatePath(bins: number[], barMax: number, start: number) {
  return `M ${start} 0 ` + bins.map((bin) => `h 1 V ${(bin / barMax) * VIEWBOX_HEIGHT}`).join(" ") + " V 0 Z";
}

function shouldUseClamped(value: number | undefined, data: HistogramGroup) {
  return (
    typeof value !== "number" ||
    (data.histogramClamped && value >= data.histogramClamped.min && value <= data.histogramClamped.max)
  );
}

function getValueAccumulation(value: number, data: HistogramData) {
  const binStep = (data.max - data.min) / data.bins.length;
  const bin = Math.floor((value - data.min) / binStep);
  if (bin < 0) {
    return 0;
  }
  if (bin >= data.bins.length) {
    return sum(data.bins);
  }
  return sum(data.bins.slice(0, bin)) + data.bins[bin] * ((value - (data.min + binStep * bin)) / binStep);
}
const Histogram = React.memo(function ({
  data,
  value,
  extraMeanLines = [],
}: {
  data?: HistogramGroup;
  value?: number;
  extraMeanLines?: number[];
}) {
  const theme = useTheme();
  if (!data) {
    return <></>;
  }
  const histogram = shouldUseClamped(value, data) ? data.histogramClamped : data.histogramFull;
  if (!histogram) {
    return <></>;
  }
  if (value !== undefined) {
    value = Math.max(histogram.min, Math.min(histogram.max, value));
  }
  const barMax = Math.max(...histogram.bins);
  const binStep = (histogram.max - histogram.min) / histogram.bins.length;
  const splitPoint = value === undefined ? histogram.bins.length : Math.ceil((value - histogram.min) / binStep);
  const ValueLine = ({ v, ...props }: { v: number } & SVGAttributes<SVGLineElement>) => {
    if (v < histogram.min || v > histogram.max) {
      return <></>;
    }
    const bin = Math.floor((v - histogram.min) / binStep);
    return (
      <line
        key={v}
        x1={bin}
        x2={bin}
        y1={0}
        y2={VIEWBOX_HEIGHT}
        stroke={theme.palette.grey[50]}
        strokeWidth={1}
        {...props}
      />
    );
  };
  return (
    <svg
      width={120}
      height={VIEWBOX_HEIGHT}
      viewBox={`0 0 ${histogram.bins.length} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <g style={{ transformOrigin: "center", transform: "scale(1, -1)" }}>
        <path
          d={generatePath(histogram.bins.slice(0, splitPoint), barMax, 0)}
          strokeWidth={1}
          fillRule="nonzero"
          stroke={theme.palette.grey[500]}
          fill={theme.palette.grey[500]}
        />
        {splitPoint < histogram.bins.length && (
          <path
            d={generatePath(histogram.bins.slice(splitPoint), barMax, splitPoint)}
            strokeWidth={1}
            fillRule="nonzero"
            stroke={theme.palette.grey[800]}
            fill={theme.palette.grey[800]}
          />
        )}
        {!Number.isInteger(binStep) && histogram.bins.length > 60 && (
          <g>
            <ValueLine v={data.mean} />
            {extraMeanLines.map((v, index) => (
              <ValueLine key={index} v={v} strokeDasharray="4 12" strokeDashoffset={index * 3} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
});

const StatHistogramInner = React.memo(function ({
  mode,
  value,
  valueFormatter,
  rankMeans,
  histogramData,
}: {
  mode: GameMode;
  value?: number;
  valueFormatter: (value: number) => string;
  rankMeans: number[];
  histogramData: Omit<HistogramGroup, "histogramFull"> & Required<Pick<HistogramGroup, "histogramFull">>;
}) {
  const { t } = useTranslation();
  const numTotal = sum(histogramData.histogramFull.bins);
  const numPos =
    value === undefined
      ? 0
      : shouldUseClamped(value, histogramData) && histogramData.histogramClamped
      ? getValueAccumulation(value, histogramData.histogramClamped) +
        getValueAccumulation(histogramData.histogramClamped.min, histogramData.histogramFull)
      : getValueAccumulation(value, histogramData.histogramFull);
  return (
    <Box>
      <Typography variant="inherit">
        <Trans defaults="{{mode}}平均值：" values={{ mode: t(modeLabelNonTranslated(mode)) }} />
        {valueFormatter(histogramData.mean)}
      </Typography>
      <Typography variant="inherit" mb={2}>
        <Trans defaults="{{mode}}各段位平均值：" values={{ mode: t(modeLabelNonTranslated(mode)) }} />
        {rankMeans.map(valueFormatter).join(" / ")}
      </Typography>
      <Histogram data={histogramData} value={value} extraMeanLines={rankMeans} />
      {value !== undefined && (
        <Typography variant="inherit">
          <Trans defaults="{{mode}}位置：" values={{ mode: t(modeLabelNonTranslated(mode)) }} />
          {formatPercent(numPos / numTotal)}
        </Typography>
      )}
    </Box>
  );
});

export function useStatHistogram({
  statKey,
  value,
  valueFormatter,
}: {
  statKey: keyof PlayerExtendedStats;
  value?: number;
  valueFormatter: (value: number) => string;
}) {
  const [model] = useModel();
  const globalHistogram = useAsyncFactory(() => getGlobalHistogram().catch(() => null), [], "globalHistogram");
  if (!globalHistogram || model.type !== "player" || model.selectedModes.length !== 1) {
    return null;
  }
  const mode = model.selectedModes[0];
  const modeHistogram = globalHistogram[mode];
  if (!modeHistogram || !(statKey in modeHistogram["0"])) {
    return null;
  }
  const histogramData = modeHistogram["0"][statKey];
  if (!histogramData?.histogramFull) {
    return null;
  }
  const rankMeans = Object.keys(modeHistogram)
    .map((x) => parseInt(x, 10))
    .filter((x) => x)
    .sort((a, b) => a - b)
    .map((x) => modeHistogram[x][statKey]?.mean)
    .filter((x) => x !== undefined) as number[];
  return (
    <StatHistogramInner
      mode={mode}
      value={value}
      valueFormatter={valueFormatter}
      rankMeans={rankMeans}
      histogramData={{ ...histogramData, histogramFull: histogramData.histogramFull }}
    />
  );
}

export const StatHistogram = React.memo(function ({
  statKey,
  value,
  valueFormatter,
}: {
  statKey: keyof PlayerExtendedStats;
  value?: number;
  valueFormatter: (value: number) => string;
}) {
  return useStatHistogram({ statKey, value, valueFormatter });
});

export default Histogram;
