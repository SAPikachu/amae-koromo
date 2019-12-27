import React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { TableCellProps, Index } from "react-virtualized";
import { Table, Column } from "react-virtualized/dist/es/Table";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import dayjs from "dayjs";
import clsx from "clsx";

import { GameRecord, GameMode } from "../../data/types";
import { Player } from "./player";
import { useScrollerProps } from "../misc/scroller";
import { useDataAdapter } from "./dataAdapterProvider";
import { triggerRelayout } from "../../utils/index";
import Loading from "../misc/loading";
import { CONTEST_MODE } from "../../data/source/constants";

export { Column } from "react-virtualized/dist/es/Table";

const formatTime = (x: number) => (x ? dayjs.unix(x).format("HH:mm") : null);

type ActivePlayerId = number | string | ((x: GameRecord) => number | string);

const Players = React.memo(({ game, activePlayerId }: { game: GameRecord; activePlayerId?: ActivePlayerId }) => {
  if (typeof activePlayerId === "function") {
    activePlayerId = activePlayerId(game);
  }
  if (typeof activePlayerId !== "string") {
    activePlayerId = activePlayerId?.toString() || "";
  }
  return (
    <div className="row no-gutters">
      {game.players.map(x => (
        <div key={x.accountId} className="col-12 col-md-6 pr-1">
          <Player game={game} player={x} isActive={x.accountId.toString() === activePlayerId} />
        </div>
      ))}
    </div>
  );
});

function isMobile() {
  return !!window.matchMedia("(max-width: 575.75px)").matches;
}

const cellFormatTime = ({ cellData }: TableCellProps) => formatTime(cellData);
const cellFormatFullTime = ({ rowData }: TableCellProps) =>
  rowData.loading ? "" : isMobile() ? GameRecord.formatStartDate(rowData) : GameRecord.formatFullStartTime(rowData);
const cellFormatRank = ({ rowData, columnData }: TableCellProps) =>
  !rowData || rowData.loading || !columnData.activePlayerId ? (
    ""
  ) : (
    <span
      className="font-weight-bold"
      style={{ color: GameRecord.getPlayerRankColor(rowData, columnData.activePlayerId) }}
    >
      {GameRecord.getPlayerRankLabel(rowData, columnData.activePlayerId).slice(0, 1)}
    </span>
  );
const cellFormatGameMode = ({ cellData }: TableCellProps) => GameMode[cellData];

function getRowHeight() {
  if (window.matchMedia("(min-width: 768px)").matches) {
    return 70;
  }
  if (!isMobile()) {
    return 140;
  }
  return 100;
}

type TableColumnDefKey = {
  key?: string;
};
export type TableColumn = React.FunctionComponentElement<Column> | false | undefined | null;
export type TableColumnDef = TableColumnDefKey & (() => TableColumn);

export function makeColumn<T extends (string | number | Function)[]>(
  builder: (...args: T) => TableColumn
): (...args: T) => TableColumnDef {
  const key = Math.random().toString();
  const newBuilder = (...args: T) => {
    const outer = () => {
      const ret = builder(...args);
      if (ret) {
        return React.cloneElement(ret, { key });
      }
      return ret;
    };
    outer.key = key + args.join("-");
    return outer;
  };
  return newBuilder;
}

export const COLUMN_GAMEMODE = makeColumn(
  () =>
    !CONTEST_MODE && (
      <Column
        dataKey="modeId"
        label={isMobile() ? "" : "等级"}
        cellRenderer={cellFormatGameMode}
        width={isMobile() ? 20 : 40}
      />
    )
)();

export const COLUMN_RANK = makeColumn((activePlayerId: number | string) => (
  <Column
    dataKey="modeId"
    label={isMobile() ? "" : "顺位"}
    columnData={{ activePlayerId }}
    cellRenderer={cellFormatRank}
    width={isMobile() ? 20 : 40}
  />
));

export const COLUMN_PLAYERS = makeColumn((activePlayerId: ActivePlayerId) => (
  <Column
    dataKey="players"
    label="玩家"
    cellRenderer={({ rowData }: TableCellProps) =>
      rowData && rowData.players ? <Players game={rowData} activePlayerId={activePlayerId} /> : null
    }
    width={120}
    flexGrow={1}
  />
));

export const COLUMN_STARTTIME = makeColumn(() => (
  <Column
    dataKey="startTime"
    label="开始"
    cellRenderer={cellFormatTime}
    width={isMobile() ? 40 : 50}
    className="text-right"
    headerClassName="text-right"
  />
))();

export const COLUMN_ENDTIME = makeColumn(() => (
  <Column
    dataKey="endTime"
    label="结束"
    cellRenderer={cellFormatTime}
    width={isMobile() ? 40 : 50}
    headerClassName="text-right"
    className="text-right"
  />
))();

export const COLUMN_FULLTIME = makeColumn(() => (
  <Column
    dataKey="startTime"
    label="时间"
    cellRenderer={cellFormatFullTime}
    width={isMobile() ? 40 : 140}
    className="text-right"
    headerClassName="text-right"
  />
))();

export default function GameRecordTable({
  columns,
  withActivePlayer = false,
  alwaysShowDetailLink = false
}: {
  columns: TableColumnDef[];
  withActivePlayer?: boolean;
  alwaysShowDetailLink?: boolean;
}) {
  const data = useDataAdapter();
  const scrollerProps = useScrollerProps();
  const { isScrolling, onChildScroll, scrollTop, height, registerChild } = scrollerProps;
  const rowGetter = useCallback(({ index }: Index) => data.getItem(index), [data]);
  const getRowClassName = useCallback(
    ({ index }: Index) => (index >= 0 ? clsx({ loading: !data.isItemLoaded(index), even: (index & 1) === 0 }) : ""),
    [data]
  );
  const noRowsRenderer = useCallback(() => (data.getUnfilteredCount() ? null : <Loading />), [data]);
  const unfilteredCount = data.getUnfilteredCount();
  const shouldTriggerLayout = !!unfilteredCount;
  useEffect(() => {
    triggerRelayout();
  }, [shouldTriggerLayout]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns.map(x => x()).filter(x => x), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isMobile(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...columns.map(x => x.key || x)
  ]);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div ref={registerChild as any} className="font-xs-adjust">
      <AutoSizer disableHeight>
        {({ width }) => (
          <Table
            autoHeight
            className={clsx(
              withActivePlayer && "with-active-player",
              alwaysShowDetailLink && "always-show-detail-link"
            )}
            rowCount={data.getCount()}
            rowGetter={rowGetter}
            rowHeight={getRowHeight()}
            headerHeight={50}
            width={width}
            height={height}
            isScrolling={isScrolling}
            onScroll={onChildScroll}
            scrollTop={scrollTop}
            rowClassName={getRowClassName}
            noRowsRenderer={noRowsRenderer}
          >
            {memoColumns}
          </Table>
        )}
      </AutoSizer>
    </div>
  );
}
