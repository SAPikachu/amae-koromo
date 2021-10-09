import React, { ReactNode, useEffect, useMemo } from "react";
import Helmet from "react-helmet";
import { DataProvider } from "../../data/source/records/provider";
import { DataAdapterProviderCustom } from "../gameRecords/dataAdapterProvider";
import GameRecordTable, { Column } from "../gameRecords/table";
import { COLUMN_PLAYERS, COLUMN_FULLTIME, makeColumn } from "../gameRecords/columns";
import { GameRecord, FanStatEntryList, HighlightEvent, GameRecordWithEvent } from "../../data/types";
import { TableCellProps } from "react-virtualized/dist/es/Table";
import { sum } from "../../utils";
import { Trans, useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { ModelModeProvider, ModelModeSelector, useModel } from "../modeModel";
import Conf from "../../utils/conf";
import { Box, Tooltip } from "@mui/material";

const t = i18n.t.bind(i18n);

const EventInfo = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <Tooltip title={<Box whiteSpace="pre">{title}</Box>} arrow placement="right">
    <Box>{children}</Box>
  </Tooltip>
);

function buildEventInfo({ cellData }: TableCellProps) {
  if (!cellData) {
    return null;
  }
  const event = cellData as HighlightEvent;
  if (!event.fan[0].役满) {
    return (
      <EventInfo title={FanStatEntryList.formatFanList(event.fan)}>
        {sum(event.fan.map((x) => x.count))} <Trans>番</Trans>
        <br />
        <Trans>累计役满</Trans>
      </EventInfo>
    );
  }
  if (event.fan.length === 1) {
    const label = t(event.fan[0].label);
    if (i18n.language === "en") {
      return <EventInfo title={label}>{label}</EventInfo>;
    }
    if (label.length > 4) {
      return (
        <EventInfo title={label}>
          {label.slice(0, 4)}
          <br />
          {label.slice(4)}
        </EventInfo>
      );
    }
    return label;
  } else if (event.fan.length === 2) {
    return (
      <EventInfo title={FanStatEntryList.formatFanList(event.fan)}>
        <Trans>{event.fan[0].label}</Trans>
        <br />
        <Trans>{event.fan[1].label}</Trans>
      </EventInfo>
    );
  }
  return (
    <EventInfo title={FanStatEntryList.formatFanList(event.fan)}>
      {FanStatEntryList.formatFanSummary(event.fan)}
    </EventInfo>
  );
}

const COLUMN_EVENTINFO = makeColumn(() => (
  <Column dataKey="event" label={<Trans>类型</Trans>} cellRenderer={buildEventInfo} width={80} />
))();

function getEventPlayerId(rec: GameRecord) {
  return (rec as GameRecordWithEvent).event.player;
}

function RecentHighlightInner() {
  const [model, updateModel] = useModel();
  const provider = useMemo(() => {
    if (!Conf.availableModes.length) {
      return DataProvider.createHightlight(undefined);
    }
    return model.selectedModes && model.selectedModes.length
      ? DataProvider.createHightlight(model.selectedModes[0])
      : null;
  }, [model]);
  useEffect(() => {
    if (!model.selectedModes || !model.selectedModes.length) {
      if (Conf.availableModes.length) {
        updateModel({ selectedModes: [Conf.availableModes[0]] });
      }
    }
  }, [model, updateModel]);
  if (!provider) {
    return <></>;
  }
  return (
    <DataAdapterProviderCustom provider={provider}>
      <GameRecordTable
        columns={[
          COLUMN_EVENTINFO,
          COLUMN_PLAYERS({ activePlayerId: getEventPlayerId, alwaysShowDetailLink: true }),
          COLUMN_FULLTIME,
        ]}
      />
    </DataAdapterProviderCustom>
  );
}

export default function RecentHighlight() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet title={t("最近役满")} />
      <ModelModeProvider>
        <ModelModeSelector />
        <RecentHighlightInner />
      </ModelModeProvider>
    </>
  );
}
