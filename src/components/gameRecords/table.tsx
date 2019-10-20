import React from "react";
import { Table, Column, AutoSizer } from "react-virtualized";
import moment from "moment";
import clsx from "clsx";

import { GameRecord, GameMode } from "../../utils/dataSource";
import { Player } from "./player";
import { useScrollerProps } from "../misc/scroller";
import { useDataAdapter } from "./dataAdapterProvider";

const formatTime = (x: number) => (x ? moment.unix(x).format("HH:mm") : null);

const Players = React.memo(({ game }: { game: GameRecord }) => (
  <div className="row no-gutters">
    {game.players.map(x => (
      <div key={x.accountId} className="col-12 col-md-6 pr-1">
        <Player game={game} player={x} isTop={x.score === Math.max(...game.players.map(x => x.score))} />
      </div>
    ))}
  </div>
));

export function GameRecordTable() {
  const data = useDataAdapter();
  const scrollerProps = useScrollerProps();
  const { isScrolling, onChildScroll, scrollTop, height } = scrollerProps;
  return (
    <div ref={scrollerProps.registerChild as any}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <Table
            autoHeight
            rowCount={data.getCount()}
            rowGetter={({ index }) => data.getItem(index)}
            rowHeight={window.matchMedia("(min-width: 768px)").matches ? 70 : 140}
            headerHeight={50}
            width={width}
            height={height}
            isScrolling={isScrolling}
            onScroll={onChildScroll}
            scrollTop={scrollTop}
            rowClassName={({ index }) =>
              index >= 0 ? clsx({ loading: !data.isItemLoaded(index), even: (index & 1) === 0 }) : ""
            }
            noRowsRenderer={() => (data.getUnfilteredCount() ? null : <p className="text-center">加载中...</p>)}
          >
            <Column dataKey="modeId" label="等级" cellRenderer={({ cellData }) => GameMode[cellData]} width={40} />
            <Column
              dataKey="players"
              label="玩家"
              cellRenderer={({ rowData }) => (rowData && rowData.players ? <Players game={rowData} /> : null)}
              width={120}
              flexGrow={1}
            />
            <Column dataKey="startTime" label="开始" cellRenderer={({ cellData }) => formatTime(cellData)} width={40} />
            <Column dataKey="endTime" label="结束" cellRenderer={({ cellData }) => formatTime(cellData)} width={40} />
          </Table>
        )}
      </AutoSizer>
    </div>
  );
}
