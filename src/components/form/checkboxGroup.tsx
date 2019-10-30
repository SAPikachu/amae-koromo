import React from "react";

export interface CheckboxItem {
  key: string;
  label: string;
}

type CommonGroupParams = {
  items: CheckboxItem[];
  groupKey: string;
};
type CheckboxGroupParams = CommonGroupParams & {
  type: "checkbox";
  selectedItemKeys: Set<string> | null;
  onChange: (selectedItemKeys: Set<string>) => void;
};
type RadioGroupParams = CommonGroupParams & {
  type: "radio";
  selectedItemKey: string;
  onChange: (selectedItemKey: string) => void;
};

export function CheckboxGroup(
  props: CheckboxGroupParams | RadioGroupParams = {
    type: "checkbox",
    items: [],
    groupKey: "default",
    selectedItemKeys: null,
    onChange: () => {}
  }
) {
  const { type, items, groupKey } = props;
  const { setSelected, isChecked } = (() => {
    if (props.type === "checkbox") {
      const { selectedItemKeys, onChange } = props;
      return {
        setSelected(key: string, isSelected: boolean) {
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
        },
        isChecked: (key: string) => !selectedItemKeys || selectedItemKeys.has(key)
      };
    } else {
      const { selectedItemKey, onChange } = props;
      return {
        setSelected(key: string, isSelected: boolean) {
          if (!isSelected) {
            return;
          }
          onChange(key);
        },
        isChecked: (key: string) => selectedItemKey === key
      };
    }
  })();
  return (
    <React.Fragment>
      {items.map(item => (
        <div className="form-check form-check-inline" key={item.key}>
          <input
            className="form-check-input"
            type={type}
            id={`CG_${groupKey}_${item.key}`}
            name={`CG_${groupKey}_${item.key}`}
            value={item.key}
            checked={isChecked(item.key)}
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
