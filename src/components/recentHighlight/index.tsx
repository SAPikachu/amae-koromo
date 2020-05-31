import React, { useMemo } from "react";
import Helmet from "react-helmet";
import { DataProvider } from "../../data/source/records/provider";
import { DataAdapterProviderCustom } from "../gameRecords/dataAdapterProvider";
import GameRecordTable, {
  COLUMN_GAMEMODE,
  COLUMN_PLAYERS,
  COLUMN_FULLTIME,
  makeColumn,
  Column
} from "../gameRecords/table";
import { GameRecord, FanStatEntryList, HighlightEvent, GameRecordWithEvent } from "../../data/types";
import { TableCellProps } from "react-virtualized/dist/es/Table";
import { sum } from "../../utils";
import { Trans, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const t = i18n.t.bind(i18n);


function buildEventInfo({ cellData }: TableCellProps) {
  if (!cellData) {
    return null;
  }
  const event = cellData as HighlightEvent;
  if (!event.fan[0].役满) {
    return (
      <span>
        {sum(event.fan.map(x => x.count))} <Trans>番</Trans>
        <br />
        <Trans>累计役满</Trans>
      </span>
    );
  }
  if (event.fan.length === 1) {
    const label = t(event.fan[0].label);
    if (label.length > 4) {
      return (
        <span>
          {label.slice(0, 4)}
          <br />
          {label.slice(4)}
        </span>
      );
    }
    return label;
  } else if (event.fan.length === 2) {
    return (
      <span>
        <Trans>{event.fan[0].label}</Trans>
        <br />
        <Trans>{event.fan[1].label}</Trans>
      </span>
    );
  }
  return <span>{FanStatEntryList.formatFanSummary(event.fan)}</span>;
}

const COLUMN_EVENTINFO = makeColumn(() => (
  <Column dataKey="event" label={<Trans>类型</Trans>} cellRenderer={buildEventInfo} width={80} />
))();

function getEventPlayerId(rec: GameRecord) {
  return (rec as GameRecordWithEvent).event.player;
}

export default function RecentHighlight() {
  const { t } = useTranslation();
  const provider = useMemo(() => DataProvider.createHightlight(), []);
  return (
    <>
      <Helmet title={t("最近役满")} />
      <DataAdapterProviderCustom provider={provider}>
        <GameRecordTable
          withActivePlayer
          alwaysShowDetailLink
          columns={[COLUMN_GAMEMODE, COLUMN_EVENTINFO, COLUMN_PLAYERS(getEventPlayerId), COLUMN_FULLTIME]}
        />
      </DataAdapterProviderCustom>
    </>
  );
}
