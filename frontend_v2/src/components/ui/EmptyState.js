// src/components/ui/EmptyState.js
import React from 'react';

function EmptyState({ title, description, action }) {
  return (
    <div className="text-center p-5 bg-white border rounded">
      <div className="display-6 mb-2">📄</div>
      <h5 className="mb-2">{title}</h5>
      <p className="text-muted mb-3">{description}</p>
      {action}
    </div>
  );
}

export default EmptyState;