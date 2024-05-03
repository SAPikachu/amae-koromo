import { ReactNode, useEffect, useState } from "react";

import dayjs from "dayjs";
import {
  Button,
  MenuItem,
  Divider,
  TextField,
  Box,
  useTheme,
  MenuProps,
  Popover,
  MenuListProps,
  MenuList,
  styled,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Trans, useTranslation } from "react-i18next";
import { WatchLater, WatchLaterOutlined } from "@mui/icons-material";
import { MobileDateTimePicker, MobileDatePicker } from "@mui/lab";
import Conf from "../../utils/conf";

const NEW_THRONE_TS = dayjs("2021-08-26T02:00:00.000Z");

function ResponsiveMenu({ children, ...params }: MenuProps) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
  return (
    <Popover
      anchorOrigin={
        isMobile ? { vertical: "center", horizontal: "center" } : { vertical: "bottom", horizontal: "left" }
      }
      transformOrigin={isMobile ? { vertical: "center", horizontal: "center" } : undefined}
      {...params}
      PaperProps={{
        sx: { maxWidth: "80vw", maxHeight: "90vh", padding: 1 },
        ...(params.PaperProps || {}),
      }}
    >
      <Box display="flex" flexDirection={["column", "column", "row"]} flexWrap="wrap">
        {children}
      </Box>
    </Popover>
  );
}
const StyledMenuList = styled(MenuList)(({ theme }) => ({
  padding: 0,

  "&:last-child .MuiDivider-root:last-child": {
    display: "none",
  },
  [theme.breakpoints.up("md")]: {
    ".MuiDivider-root:last-child": {
      display: "none",
    },
  },
}));
function MenuGroup({ children, ...params }: MenuListProps) {
  return (
    <StyledMenuList {...params}>
      {children}
      <Divider sx={{ my: 1 }} />
    </StyledMenuList>
  );
}

function DatePickerMenuItem({
  onClose,
  onChange,
  value,
  children,
}: {
  onClose: () => void;
  onChange: (value: dayjs.ConfigType) => void;
  value: dayjs.ConfigType;
  children: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState("closed" as "closed" | "date" | "datetime");
  const [selectedDate, setSelectedDate] = useState(dayjs(value));
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [closePending, setClosePending] = useState(false);
  const open = function () {
    onClose();
    setSelectedDate(dayjs(value));
    setClosePending(false);
    setState(timeEnabled ? "datetime" : "date");
  };
  useEffect(() => {
    if (!closePending) {
      return;
    }
    if (timeEnabled && state === "date") {
      setClosePending(false);
      setState("datetime");
      return;
    }
    setState("closed");
  }, [closePending, state, timeEnabled]);
  return (
    <>
      <MenuItem dense onClick={open}>
        {children}
      </MenuItem>
      <Box display="none">
        {timeEnabled ? (
          <MobileDateTimePicker
            open={state !== "closed"}
            ampm={false}
            onClose={() => setClosePending(true)}
            renderInput={(params) => <TextField {...params} />}
            value={selectedDate}
            onAccept={onChange}
            onChange={(newDate) => setSelectedDate(dayjs(newDate))}
            minDateTime={dayjs(Conf.dateMin)}
            maxDateTime={dayjs().endOf("day")}
            cancelText={""}
            okText={t("确定")}
            mask="____-__-__ __:__"
            toolbarTitle=""
            toolbarFormat={i18n.language === "en" ? "MMM D" : "M/D"}
            disableCloseOnSelect
          />
        ) : (
          <MobileDatePicker
            open={state !== "closed"}
            onClose={() => setClosePending(true)}
            renderInput={(params) => <TextField {...params} />}
            value={selectedDate}
            onAccept={(newDate) => void (newDate ? onChange(newDate) : setTimeEnabled(true))}
            clearable
            onChange={(newDate) => void (newDate ? setSelectedDate(newDate) : setTimeEnabled(true))}
            minDate={dayjs(Conf.dateMin)}
            maxDate={dayjs().endOf("day")}
            cancelText={""}
            okText={""}
            clearText={t("自定义时间")}
            mask="____-__-__"
            toolbarTitle=""
            toolbarFormat={" "}
            disableCloseOnSelect={false}
          />
        )}
      </Box>
    </>
  );
}

export default function DateRangeSetting({
  onSelectDate,
  onSelectLimit,
  start,
  end,
  limit,
  isThrone,
}: {
  onSelectDate: (start: dayjs.ConfigType | null, end: dayjs.ConfigType | null) => void;
  onSelectLimit: (limit: number) => void;
  start: dayjs.ConfigType | null;
  end: dayjs.ConfigType | null;
  limit: number | null;
  isThrone: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState(null as HTMLElement | null);
  const handleClose = () => setAnchorEl(null);
  const selectAll = () => {
    onSelectDate(null, null);
    handleClose();
  };
  const selectWeek = (week: number) => {
    onSelectDate(
      dayjs()
        .subtract(week * 7 - 1, "day")
        .startOf("day"),
      null
    );
    handleClose();
  };
  const selectLimit = (limit: number) => {
    onSelectLimit(limit);
    handleClose();
  };
  const selectRange = (start: dayjs.Dayjs, end: dayjs.Dayjs | null = null) => {
    onSelectDate(start, end);
    handleClose();
  };
  const haveCustomRange = start || end || limit;
  const shouldRenderTime =
    (start && !dayjs(start).startOf("day").isSame(start, "second")) ||
    (end && !dayjs(end).endOf("day").isSame(end, "second"));
  const format = shouldRenderTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
  const isNewThrone = isThrone && !end && start && dayjs(start).isSame(NEW_THRONE_TS);
  const isOldThrone =
    isThrone && end && (!start || !dayjs(start).isAfter(Conf.dateMin)) && dayjs(end).isSame(NEW_THRONE_TS);
  return (
    <div>
      <Button
        disableElevation
        variant={haveCustomRange ? "outlined" : "text"}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={haveCustomRange ? <WatchLater /> : <WatchLaterOutlined />}
      >
        {haveCustomRange ? (
          isNewThrone ? (
            <Trans>新王座</Trans>
          ) : isOldThrone ? (
            <Trans>旧王座</Trans>
          ) : limit ? (
            <Trans defaults="最近 {{x}} 场" count={limit} values={{ x: limit }} />
          ) : (
            `${dayjs(start || Conf.dateMin).format(format)} ~ ${dayjs(end || undefined).format(format)}`
          )
        ) : (
          <Trans>时间</Trans>
        )}
      </Button>
      <ResponsiveMenu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} keepMounted>
        <MenuGroup>
          <MenuItem dense onClick={selectAll}>
            <Trans>全部</Trans>
          </MenuItem>
          <Divider />
          <DatePickerMenuItem
            onClose={handleClose}
            value={start || dayjs(Conf.dateMin)}
            onChange={(date) => onSelectDate(date, end || dayjs().endOf("day"))}
          >
            <Trans>自定开始时间...</Trans>
          </DatePickerMenuItem>
          <DatePickerMenuItem
            onClose={handleClose}
            value={end || dayjs().endOf("day")}
            onChange={(date) => onSelectDate(start || dayjs(Conf.dateMin), dayjs(date).endOf("minute"))}
          >
            <Trans>自定结束时间...</Trans>
          </DatePickerMenuItem>
        </MenuGroup>
        <MenuGroup>
          {[4, 13, 26, 52].map((x) => (
            <MenuItem dense key={x} onClick={() => selectWeek(x)}>
              <Trans defaults="最近 {{x}} 周" count={x} values={{ x }} />
            </MenuItem>
          ))}
        </MenuGroup>
        <MenuGroup>
          <MenuItem dense onClick={() => selectRange(dayjs().startOf("month"))}>
            <Trans>本月</Trans>
          </MenuItem>
          <MenuItem
            dense
            onClick={() =>
              selectRange(dayjs().startOf("month").subtract(1, "month"), dayjs().startOf("month").subtract(1, "second"))
            }
          >
            <Trans>上月</Trans>
          </MenuItem>
          <MenuItem dense onClick={() => selectRange(dayjs().startOf("year"))}>
            <Trans>今年</Trans>
          </MenuItem>
          <MenuItem
            dense
            onClick={() =>
              selectRange(dayjs().startOf("year").subtract(1, "year"), dayjs().startOf("year").subtract(1, "second"))
            }
          >
            <Trans>去年</Trans>
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          {[100, 200, 300, 500].map((x) => (
            <MenuItem dense key={x} onClick={() => selectLimit(x)}>
              <Trans defaults="最近 {{x}} 场" count={x} values={{ x }} />
            </MenuItem>
          ))}
        </MenuGroup>
        {isThrone && (
          <MenuGroup>
            <MenuItem dense onClick={() => selectRange(NEW_THRONE_TS)}>
              <Trans>新王座</Trans>
            </MenuItem>
            <MenuItem dense onClick={() => selectRange(dayjs(Conf.dateMin), NEW_THRONE_TS)}>
              <Trans>旧王座</Trans>
            </MenuItem>
          </MenuGroup>
        )}
      </ResponsiveMenu>
    </div>
  );
}
