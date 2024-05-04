import React from "react";
import { TableCellProps } from "react-virtualized";
import { Column } from "react-virtualized/dist/es/Table";
import dayjs from "dayjs";
import { GameRecord, modeLabel } from "../../data/types";
import { Player } from "./player";
import Conf from "../../utils/conf";
import { Trans } from "react-i18next";
import i18n from "../../i18n";
import { Box, Tooltip, TypographyProps, useTheme } from "@mui/material";

const formatTime = (x: number) => (x ? dayjs.unix(x).format("HH:mm") : null);
type ActivePlayerId = number | string | ((x: GameRecord) => number | string);
type PlayersProps = {
  game: GameRecord;
  activePlayerId?: ActivePlayerId;
  language?: string;
  activeProps?: TypographyProps;
  inactiveProps?: TypographyProps;
  alwaysShowDetailLink?: boolean;
  maskedGameLink?: boolean;
};
const Players = React.memo(
  ({ game, activePlayerId, alwaysShowDetailLink, activeProps, inactiveProps, maskedGameLink }: PlayersProps) => {
    const theme = useTheme();
    if (typeof activePlayerId === "function") {
      activePlayerId = activePlayerId(game);
    }
    if (typeof activePlayerId !== "string") {
      activePlayerId = activePlayerId?.toString() || "";
    }
    if (activePlayerId) {
      inactiveProps = inactiveProps || {
        color: theme.palette.grey[500],
      };
    }
    return (
      <Box display="grid" gridTemplateColumns={["1fr", null, "1fr 1fr"]}>
        {game.players.map((x) => (
          <Player
            key={x.accountId}
            game={game}
            player={x}
            maskedGameLink={maskedGameLink}
            {...(x.accountId.toString() === activePlayerId
              ? { hideDetailIcon: !alwaysShowDetailLink, showAiReviewIcon: !alwaysShowDetailLink, ...activeProps }
              : inactiveProps)}
          />
        ))}
      </Box>
    );
  }
);
const cellFormatTime = ({ cellData }: TableCellProps) => formatTime(cellData);
const cellFormatFullTime = ({ rowData }: TableCellProps) =>
  rowData.loading ? "" : GameRecord.formatFullStartTime(rowData);
const cellFormatFullTimeMobile = ({ rowData }: TableCellProps) =>
  rowData.loading ? (
    ""
  ) : (
    <Tooltip title={GameRecord.formatFullStartTime(rowData)} placement="left" arrow>
      <Box>
        <Box>{GameRecord.formatStartDate(rowData)}</Box>
        <Box>{formatTime(rowData.startTime)}</Box>
      </Box>
    </Tooltip>
  );
const cellFormatRank = ({ rowData, columnData }: TableCellProps) =>
  !rowData || rowData.loading || !columnData.activePlayerId ? (
    ""
  ) : (
    <Box fontWeight="bold" color={GameRecord.getPlayerRankColor(rowData, columnData.activePlayerId)}>
      {GameRecord.getPlayerRankLabel(rowData, columnData.activePlayerId)
        .slice(0, 1)
        .replace(/[0-9]/g, (s) => String.fromCodePoint(s.charCodeAt(0) + 0xfee0))}
    </Box>
  );
const cellFormatGameMode = ({ cellData }: TableCellProps) => (cellData ? modeLabel(parseInt(cellData)) : "");

type TableColumnDefKey = {
  key?: string;
};
export type TableColumn = React.FunctionComponentElement<Column> | false | undefined | null;
export type TableColumnDef = TableColumnDefKey & (() => TableColumn);

// eslint-disable-next-line @typescript-eslint/ban-types
export function makeColumn<T extends unknown[]>(builder: (...args: T) => TableColumn): (...args: T) => TableColumnDef {
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
    Conf.table.showGameMode && (
      <Column
        dataKey="modeId"
        label={<Trans>等级</Trans>}
        cellRenderer={cellFormatGameMode}
        width={40}
        columnData={{
          mobileProps: {
            label: "",
            width: 20,
            style: {
              writingMode: "vertical-lr",
              padding: "0.5rem 0",
            },
          },
        }}
      />
    )
)();

export const COLUMN_RANK = makeColumn((activePlayerId: number | string) => (
  <Column
    dataKey="modeId"
    label={<Trans>顺位</Trans>}
    columnData={{
      activePlayerId,
      mobileProps: {
        label: "",
        width: 20,
        style: {
          writingMode: "vertical-lr",
          padding: "0.5rem 0",
        },
      },
    }}
    cellRenderer={cellFormatRank}
    width={40}
  />
));

export const COLUMN_PLAYERS = makeColumn((props: Partial<Omit<PlayersProps, "game">> = {}) => (
  <Column
    dataKey="players"
    label={<Trans>玩家</Trans>}
    cellRenderer={({ rowData }: TableCellProps) =>
      rowData && rowData.players ? <Players game={rowData} language={i18n.language} {...props} /> : null
    }
    width={120}
    flexGrow={1}
  />
));

export const COLUMN_STARTTIME = makeColumn(() => (
  <Column
    dataKey="startTime"
    label={<Trans>开始</Trans>}
    cellRenderer={cellFormatTime}
    width={50}
    className="text-right"
    headerClassName="text-right"
    columnData={{
      mobileProps: {
        width: 40,
      },
    }}
  />
))();

export const COLUMN_ENDTIME = makeColumn(() => (
  <Column
    dataKey="endTime"
    label={<Trans>结束</Trans>}
    cellRenderer={cellFormatTime}
    width={50}
    headerClassName="text-right"
    className="text-right"
    columnData={{
      mobileProps: {
        width: 40,
      },
    }}
  />
))();

export const COLUMN_FULLTIME = makeColumn(() => (
  <Column
    dataKey="startTime"
    label={<Trans>时间</Trans>}
    cellRenderer={cellFormatFullTime}
    width={150}
    className="text-right"
    headerClassName="text-right"
    columnData={{
      mobileProps: {
        width: 45,
        cellRenderer: cellFormatFullTimeMobile,
      },
    }}
  />
))();
