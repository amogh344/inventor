// src/components/ui/TableToolbar.js
import React from 'react';
import { Button, Form } from 'react-bootstrap';

function TableToolbar({ search, onSearchChange, actions }) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      <Form.Control
        style={{ maxWidth: 300 }}
        type="search"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="ms-auto d-flex gap-2">
        {actions}
      </div>
    </div>
  );
}

export default TableToolbar;
