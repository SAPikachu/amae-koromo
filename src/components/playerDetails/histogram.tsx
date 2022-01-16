import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { getGlobalHistogram } from "../../data/source/misc";

import { HistogramData, HistogramGroup, modeLabelNonTranslated, PlayerExtendedStats } from "../../data/types";
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
const Histogram = React.memo(function ({ data, value }: { data?: HistogramGroup; value?: number }) {
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
  const meanBin = Math.floor((data.mean - histogram.min) / binStep);
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
          <line
            stroke={theme.palette.grey[50]}
            x1={meanBin}
            x2={meanBin}
            y1={0}
            y2={VIEWBOX_HEIGHT}
            strokeWidth={1}
            strokeDasharray={4}
          />
        )}
      </g>
    </svg>
  );
});

function getValuePosition(value: number, data: HistogramData) {
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

export const StatHistogram = React.memo(function ({
  statKey,
  value,
  valueFormatter,
}: {
  statKey: keyof PlayerExtendedStats;
  value?: number;
  valueFormatter: (value: number) => string;
}) {
  const { t } = useTranslation();
  const [model] = useModel();
  const globalHistogram = useAsyncFactory(() => getGlobalHistogram().catch(() => null), [], "globalHistogram");
  if (!globalHistogram || model.type !== "player" || model.selectedModes.length !== 1) {
    return <></>;
  }
  const mode = model.selectedModes[0];
  const modeHistogram = globalHistogram[mode];
  if (!modeHistogram || !(statKey in modeHistogram["0"])) {
    return <></>;
  }
  const histogramData = modeHistogram["0"][statKey];
  if (!histogramData?.histogramFull) {
    return <></>;
  }
  const numTotal = sum(histogramData.histogramFull.bins);
  const numPos =
    value === undefined
      ? 0
      : shouldUseClamped(value, histogramData) && histogramData.histogramClamped
      ? getValuePosition(value, histogramData.histogramClamped) +
        getValuePosition(histogramData.histogramClamped.min, histogramData.histogramFull)
      : getValuePosition(value, histogramData.histogramFull);
  return (
    <Box>
      <Typography variant="inherit" mb={2}>
        <Trans defaults="{{mode}}之间平均值：" values={{ mode: t(modeLabelNonTranslated(mode)) }} />
        {valueFormatter(histogramData.mean)}
      </Typography>
      <Histogram data={histogramData} value={value} />
      {value !== undefined && (
        <Typography variant="inherit">
          <Trans defaults="{{mode}}之间位置：" values={{ mode: t(modeLabelNonTranslated(mode)) }} />
          {formatPercent(numPos / numTotal)}
        </Typography>
      )}
    </Box>
  );
});

export default Histogram;
