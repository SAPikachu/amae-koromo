import { useState, useCallback } from "react";
import React from "react";

export interface CheckboxItem {
  key: string;
  label: string;
}

export function CheckboxGroup({
  items = [] as CheckboxItem[],
  selectedItemKeys = null as Set<string> | null,
  groupKey = "default",
  onChange = (selectedItemKeys: Set<string>) => {}
}) {
  const setSelected = function(key: string, isSelected: boolean) {
    if (isSelected && (!selectedItemKeys || selectedItemKeys.has(key))) {
      return;
    }
    if (!isSelected && selectedItemKeys && !selectedItemKeys.has(key)) {
      return;
    }
    const newSet = new Set(selectedItemKeys || items.map(x => x.key));
    if (isSelected) {
      newSet.add(key);
    } else {
      newSet.delete(key);
    }
    onChange(newSet);
  };
  return (
    <React.Fragment>
      {items.map(item => (
        <div className="form-check form-check-inline" key={item.key}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`CG_${groupKey}_${item.key}`}
            value={item.key}
            checked={!selectedItemKeys || selectedItemKeys.has(item.key)}
            onChange={event => setSelected(item.key, event.currentTarget.checked)}
          />
          <label className="form-check-label" htmlFor={`CG_${groupKey}_${item.key}`}>
            {item.label}
          </label>
        </div>
      ))}
    </React.Fragment>
  );
}
