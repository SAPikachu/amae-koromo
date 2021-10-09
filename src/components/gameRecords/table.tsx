import React, { useCallback, useEffect, useMemo } from "react";
import { Index } from "react-virtualized";
import { ColumnProps, Table } from "react-virtualized/dist/es/Table";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import clsx from "clsx";

import { useScrollerProps } from "../misc/scroller";
import { useDataAdapter } from "./dataAdapterProvider";
import { triggerRelayout, useIsMobile } from "../../utils/index";
import Loading from "../misc/loading";
import { useTranslation } from "react-i18next";
import { TableColumnDef } from "./columns";
import { Box, styled, useMediaQuery, useTheme } from "@mui/material";

export { Column } from "react-virtualized/dist/es/Table";

const StyledTableContainer = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
}));

export default function GameRecordTable({ columns }: { columns: TableColumnDef[] }) {
  const { i18n } = useTranslation();
  const data = useDataAdapter();
  const scrollerProps = useScrollerProps();
  const { isScrolling, onChildScroll, scrollTop, height, registerChild } = scrollerProps;
  const rowGetter = useCallback(({ index }: Index) => data.getItem(index), [data]);
  const getRowClassName = useCallback(
    ({ index }: Index) => (index >= 0 ? clsx({ loading: !data.isItemLoaded(index), even: (index & 1) === 0 }) : ""),
    [data]
  );
  const noRowsRenderer = useCallback(() => (data.hasCount() ? null : <Loading />), [data]);
  const unfilteredCount = data.getUnfilteredCount();
  const shouldTriggerLayout = !!unfilteredCount;
  const isMobile = useIsMobile();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  useEffect(() => {
    triggerRelayout();
  }, [shouldTriggerLayout]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(
    () =>
      columns
        .map((x) => x())
        .filter((x) => x)
        .map((x) => {
          if (!isMobile) {
            return x;
          }
          const props = x && (x.props as unknown as ColumnProps);
          if (!props) {
            return x;
          }
          if (props.columnData?.mobileProps) {
            return React.cloneElement(x, { ...props, ...props.columnData?.mobileProps });
          }
          return x;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isMobile,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      i18n.language,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...columns.map((x) => x.key || x),
    ]
  );
  if (data.hasCount() && !data.getCount()) {
    return <></>;
  }
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <StyledTableContainer ref={registerChild as any}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <Table
            autoHeight
            rowCount={data.getCount()}
            rowGetter={rowGetter}
            rowHeight={isMd ? 70 : !isMobile ? 140 : 100}
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
    </StyledTableContainer>
  );
}
