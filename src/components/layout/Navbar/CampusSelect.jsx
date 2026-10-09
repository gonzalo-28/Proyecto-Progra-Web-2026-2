// src/components/layout/Navbar/CampuesSelect.jsx

import Select from '../../ui/Select/Select';

/**
 * Selector de campus del navbar: un Select compacto.
 * Props: value, options [{ value, label }], onChange(value: string)
 */
export default function CampusSelect({ value, options, onChange }) {
  return (
    <Select
      size="sm"
      aria-label="Campus"
      options={options}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
