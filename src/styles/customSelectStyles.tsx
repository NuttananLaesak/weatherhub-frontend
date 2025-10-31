import type { StylesConfig } from "react-select";

type OptionType = {
  value: number;
  label: string;
};

export const customSelectStyles: StylesConfig<OptionType, false> = {
  container: (provided) => ({
    ...provided,
    width: "200px",
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#1f2937" : "#111827",
    borderColor: state.isFocused ? "#3b82f6" : "#374151",
    color: "#fff",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    boxShadow: "none",
    minHeight: "38px",
    overflow: "hidden",
  }),
  valueContainer: (provided) => ({
    ...provided,
    overflowX: "auto" as const,
    whiteSpace: "nowrap",
    paddingRight: "8px",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE 10+
    "&::-webkit-scrollbar": {
      display: "none", // Chrome, Safari, Edge
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff",
    minWidth: 0,
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#1f2937",
    width: "auto",
    minWidth: "200px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#374151"
      : "#1f2937",
    color: state.isSelected ? "#fff" : "#d1d5db",
    "&:active": {
      backgroundColor: "#2563eb",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#3b82f6" : "#d1d5db",
    "&:hover": { color: "#3b82f6" },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#d1d5db",
    "&:hover": { color: "#fff" },
  }),
};
