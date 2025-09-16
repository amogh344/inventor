// src/components/ui/PaginationBar.js
import React from 'react';
import { Pagination, Form } from 'react-bootstrap';

function PaginationBar({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goto = (p) => {
    const np = Math.min(Math.max(1, p), totalPages);
    onPageChange(np);
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="d-flex align-items-center justify-content-between my-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Rows per page</span>
        <Form.Select
          size="sm"
          style={{ width: 80 }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        >
          {[10, 25, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Form.Select>
        <span className="text-muted">
          {start}–{end} of {total}
        </span>
      </div>
      <Pagination className="mb-0">
        <Pagination.First onClick={() => goto(1)} disabled={!canPrev} />
        <Pagination.Prev onClick={() => goto(page - 1)} disabled={!canPrev} />
        <Pagination.Item active>{page}</Pagination.Item>
        <Pagination.Next onClick={() => goto(page + 1)} disabled={!canNext} />
        <Pagination.Last onClick={() => goto(totalPages)} disabled={!canNext} />
      </Pagination>
    </div>
  );
}

export default PaginationBar;
