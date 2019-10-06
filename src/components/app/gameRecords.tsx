import { useState } from "react";
import React from "react";
import {
  Table,
  Column,
  WindowScrollerChildProps,
  AutoSizer
} from "react-virtualized";
import moment from "moment";

import { GameRecordDataController } from "./gameRecordDataController";
import { GameRecord, GameMode } from "../../utils/dataSource";
import { Player } from "./player";

const formatTime = (x: number) => moment.unix(x).format("HH:mm");

const renderPlayers = (game: GameRecord) => (
  <div className="row no-gutters">
    {game.players.map(x => (
      <div key={x.accountId} className="col-12 col-md-6 pr-1">
        <Player
          game={game}
          player={x}
          isTop={x.score === Math.max(...game.players.map(x => x.score))}
        />
      </div>
    ))}
  </div>
);

export function GameRecords({
  initialDate = undefined as Date | undefined,
  scrollerProps = {} as WindowScrollerChildProps
}) {
  [initialDate] = useState(() => initialDate || new Date()); // Set default value and remember
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([] as GameRecord[]);
  const { isScrolling, onChildScroll, scrollTop, height } = scrollerProps;
  return (
    <React.Fragment>
      <GameRecordDataController
        initialDate={initialDate}
        setData={setData}
        setLoading={setLoading}
      />
      <div ref={scrollerProps.registerChild as any}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              autoHeight
              rowCount={data.length}
              rowGetter={({ index }) => data[index]}
              rowHeight={
                window.matchMedia("(min-width: 720px)").matches ? 70 : 140
              }
              headerHeight={50}
              width={width}
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
            >
              <Column
                dataKey="modeId"
                label="等级"
                cellRenderer={({ cellData }) => GameMode[cellData]}
                width={40}
              />
              <Column
                dataKey="players"
                label="玩家"
                cellRenderer={({ rowData }) =>
                  rowData ? renderPlayers(rowData) : null
                }
                width={120}
                flexGrow={1}
              />
              <Column
                dataKey="startTime"
                label="开始"
                cellRenderer={({ cellData }) => formatTime(cellData)}
                width={40}
              />
              <Column
                dataKey="endTime"
                label="结束"
                cellRenderer={({ cellData }) => formatTime(cellData)}
                width={40}
              />
            </Table>
          )}
        </AutoSizer>
      </div>
      {loading && <p className="text-center">加载中...</p>}
    </React.Fragment>
  );
}
