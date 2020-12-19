import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useState } from "react";

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
};
export function CheckboxGroup<T>(
  props: GroupParams<T> = {
    type: "checkbox",
    items: [],
    groupKey: "default",
    selectedItems: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: () => {},
  }
) {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(null as string | null);
  const selectedItemKeys = useMemo(() => {
    const ret = new Set<string>();
    for (const item of props.selectedItems || []) {
      if (typeof item === "string") {
        ret.add(item);
      } else {
        ret.add(item.key);
      }
    }
    return ret;
  }, [props.selectedItems]);
  const { type, items, groupKey, onChange } = props;
  const { setSelected, selectSingle } = useMemo(() => {
    if (props.type === "checkbox") {
      return {
        setSelected(key: string, isSelected: boolean) {
          if (isSelected && selectedItemKeys.has(key)) {
            return;
          }
          if (!isSelected && !selectedItemKeys.has(key)) {
            return;
          }
          const newSet = new Set(selectedItemKeys || items.map((x) => x.key));
          if (isSelected) {
            newSet.add(key);
          } else {
            newSet.delete(key);
          }
          onChange(items.filter((x) => newSet.has(x.key)));
        },
        selectSingle(key: string) {
          if (selectedItemKeys.size === 1 && selectedItemKeys.has(key)) {
            return;
          }
          onChange(items.filter((x) => x.key === key));
        },
      };
    } else {
      return {
        setSelected(key: string, isSelected: boolean) {
          if (!isSelected) {
            return;
          }
          const item = items.find((x) => x.key === key);
          onChange(item ? [item] : []);
        },
        selectSingle(key: string) {
          setSelected(key, true);
        },
      };
    }
  }, [items, onChange, props.type, selectedItemKeys]);
  return (
    <div className={clsx("checkbox-group", "checkbox-group-" + type, activeKey && "checkbox-group-has-active")}>
      {items.map((item) => (
        <div className={clsx("form-check form-check-inline", activeKey === item.key && "active")} key={item.key}>
          <input
            className="form-check-input"
            type={type}
            id={`CG_${groupKey}_${item.key}`}
            name={`CG_${groupKey}_${item.key}`}
            value={item.key}
            checked={selectedItemKeys.has(item.key)}
            onChange={(event) => setSelected(item.key, event.currentTarget.checked)}
          />
          <label
            className="form-check-label"
            htmlFor={`CG_${groupKey}_${item.key}`}
            onMouseEnter={() => setActiveKey(item.key)}
            onMouseLeave={() => (activeKey === item.key ? setActiveKey(null) : undefined)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectSingle(item.key);
            }}
          >
            {t(item.label)}
          </label>
        </div>
      ))}
    </div>
  );
}