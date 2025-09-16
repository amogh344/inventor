// frontend_v2/src/components/ui/SortDropdown.js

import React from 'react';
import { Form } from 'react-bootstrap';

function SortDropdown({ options, value, onChange }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <Form.Label className="mb-0 fw-bold small text-nowrap">Sort by:</Form.Label>
      <Form.Select size="sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}

export default SortDropdown;