import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
} from "@mui/material";

export interface CheckboxItem<T> {
  key: string;
  label: string;
  value: T;
}

type GroupParams<T> = {
  type: "checkbox" | "radio";
  items: CheckboxItem<T>[];
  groupKey: string;
  selectedItems: Iterable<string | CheckboxItem<T>> | null;
  onChange: (selectedItems: CheckboxItem<T>[]) => void;
  i18nNamespace?: string | undefined;
  label?: string;
};
function InternalRadioGroup<T>({
  items = [],
  selectedItems = null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
  i18nNamespace = undefined,
}: GroupParams<T>) {
  const { t } = useTranslation(i18nNamespace);
  const selectedItemKey = useMemo(() => {
    for (const item of selectedItems || []) {
      if (typeof item === "string") {
        return item;
      } else {
        return item.key;
      }
    }
    return undefined;
  }, [selectedItems]);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement).value;
      if (value === selectedItemKey) {
        return;
      }
      const item = items.find((x) => x.key === value);
      onChange(item ? [item] : []);
    },
    [items, onChange, selectedItemKey]
  );
  return (
    <MuiRadioGroup value={selectedItemKey || null} onChange={handleChange} row>
      {items.map((x) => (
        <FormControlLabel key={x.key} value={x.key} label={t(x.label)} control={<Radio size="small" />} />
      ))}
    </MuiRadioGroup>
  );
}
function InternalCheckboxGroup<T>({
  items = [],
  selectedItems = null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
  i18nNamespace = undefined,
}: GroupParams<T>) {
  const { t } = useTranslation(i18nNamespace);
  const [highlightKey, setHighlightKey] = useState(null as string | null);
  const selectedItemKeys = useMemo(() => {
    const ret = new Set<string>();
    for (const item of selectedItems || []) {
      if (typeof item === "string") {
        ret.add(item);
      } else {
        ret.add(item.key);
      }
    }
    return ret;
  }, [selectedItems]);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const key = (e.currentTarget as HTMLElement).dataset.value as string;

      if (!(e.target as HTMLElement).classList.contains("MuiFormControlLabel-label")) {
        const newSet = new Set(selectedItemKeys);
        if (selectedItemKeys.has(key)) {
          if (selectedItemKeys.size === 1) {
            return;
          }
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        onChange(items.filter((x) => newSet.has(x.key)));
      } else {
        if (selectedItemKeys.size === 1 && selectedItemKeys.has(key)) {
          return;
        }
        onChange(items.filter((x) => key === x.key));
      }
    },
    [items, onChange, selectedItemKeys]
  );
  const handleMouseOver = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains("MuiFormControlLabel-label")) {
      return;
    }
    const key = (e.currentTarget as HTMLElement).dataset.value as string;
    setHighlightKey(key);
  };
  const handleMouseOut = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains("MuiFormControlLabel-label")) {
      return;
    }
    const key = (e.currentTarget as HTMLElement).dataset.value as string;
    setHighlightKey((oldValue) => (oldValue === key ? null : oldValue));
  };
  return (
    <FormGroup row>
      {items.map((x) => (
        <FormControlLabel
          key={x.key}
          value={x.key}
          label={t(x.label)}
          data-value={x.key}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          sx={{
            opacity: !highlightKey || highlightKey === x.key ? 1 : 0.25,
            transition: (theme) => theme.transitions.create("opacity"),
          }}
          control={<Checkbox checked={selectedItemKeys.has(x.key)} size="small" />}
        />
      ))}
    </FormGroup>
  );
}
export function CheckboxGroup<T>(
  props: GroupParams<T> = {
    type: "checkbox",
    items: [],
    groupKey: "default",
    selectedItems: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: () => {},
    i18nNamespace: undefined,
    label: "",
  }
) {
  const { t } = useTranslation(props.i18nNamespace);
  return (
    <FormControl component="fieldset">
      {props.label && <FormLabel component="legend">{t(props.label)}</FormLabel>}
      {props.type === "checkbox" ? <InternalCheckboxGroup {...props} /> : <InternalRadioGroup {...props} />}
    </FormControl>
  );
}
