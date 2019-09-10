import { useState } from "react";
import React from "react";

export type CheckboxItem = {
  key: string;
  label: string;
};

export function CheckboxGroup({
  items = [] as CheckboxItem[],
  checkedItems = [] as CheckboxItem[],
  groupKey = "default",
  onChange = (selectedItems: CheckboxItem[]) => {},
}) {
  const [selectedItemKeys, setSelectedItemKeys] = useState(() => new Set(checkedItems.map(x => x.key)));
  const setSelected = function(key: string, isSelected: boolean) {
    if (isSelected && selectedItemKeys.has(key)) {
      return;
    }
    if (!isSelected && !selectedItemKeys.has(key)) {
      return;
    }
    const newSet = new Set(selectedItemKeys);
    if (isSelected) {
      newSet.add(key);
    } else {
      newSet.delete(key);
    }
    setSelectedItemKeys(newSet);
    onChange(items.filter(x => newSet.has(x.key)));
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
            checked={selectedItemKeys.has(item.key)}
            onChange={event => setSelected(item.key, event.target.checked)}
          />
          <label className="form-check-label" htmlFor={`CG_${groupKey}_${item.key}`}>
            {item.label}
          </label>
        </div>
      ))}
    </React.Fragment>
  );
}
