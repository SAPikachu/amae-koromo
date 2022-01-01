import { ReactNode, useEffect, useState } from "react";

import dayjs from "dayjs";
import { Button, Menu, MenuItem, Divider, TextField, Box, useMediaQuery, useTheme } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { WatchLater, WatchLaterOutlined } from "@mui/icons-material";
import { MobileDateTimePicker, MobileDatePicker } from "@mui/lab";
import Conf from "../../utils/conf";

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
  start,
  end,
}: {
  onSelectDate: (start: dayjs.ConfigType | null, end: dayjs.ConfigType | null) => void;
  start: dayjs.ConfigType | null;
  end: dayjs.ConfigType | null;
}) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
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
  const selectRange = (start: dayjs.Dayjs, end: dayjs.Dayjs | null = null) => {
    onSelectDate(start, end);
    handleClose();
  };
  const haveDateTime = start || end;
  const shouldRenderTime =
    (start && !dayjs(start).startOf("day").isSame(start, "second")) ||
    (end && !dayjs(end).endOf("day").isSame(end, "second"));
  const format = shouldRenderTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
  return (
    <div>
      <Button
        disableElevation
        variant={haveDateTime ? "outlined" : "text"}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={haveDateTime ? <WatchLater /> : <WatchLaterOutlined />}
      >
        {haveDateTime ? (
          `${dayjs(start || Conf.dateMin).format(format)} ~ ${dayjs(end || undefined).format(format)}`
        ) : (
          <Trans>时间</Trans>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        keepMounted
        anchorOrigin={isMobile ? { vertical: "center", horizontal: "center" } : undefined}
        transformOrigin={isMobile ? { vertical: "center", horizontal: "center" } : undefined}
      >
        <MenuItem dense onClick={selectAll}>
          <Trans>全部</Trans>
        </MenuItem>
        <Divider />
        {[4, 13, 26, 52].map((x) => (
          <MenuItem dense key={x} onClick={() => selectWeek(x)}>
            <Trans defaults="最近 {{x}} 周" count={x} values={{ x }} />
          </MenuItem>
        ))}
        <Divider />
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
      </Menu>
    </div>
  );
}
