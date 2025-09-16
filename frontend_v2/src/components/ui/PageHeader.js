// src/components/ui/PageHeader.js
import React from 'react';

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header d-flex flex-wrap align-items-center justify-content-between mb-3">
      <div className="pe-3">
        <h1 className="mb-0">{title}</h1>
        {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
      </div>
      {actions && <div className="d-flex gap-2 mt-2 mt-sm-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;