import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

// ------------------------------
// Breadcrumbs Component
// Dynamically generates breadcrumbs based on the current URL path
// ------------------------------
function Breadcrumbs() {
  // --------------------------
  // Get current location
  // --------------------------
  const location = useLocation();

  // --------------------------
  // Split path into parts and generate breadcrumb items
  // --------------------------
  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = parts.map((part, idx) => {
    const to = '/' + parts.slice(0, idx + 1).join('/');
    const isLast = idx === parts.length - 1;

    // Convert URL part to readable label
    const label = part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return isLast ? (
      <Breadcrumb.Item active key={to}>{label}</Breadcrumb.Item>
    ) : (
      <Breadcrumb.Item linkAs={Link} linkProps={{ to }} key={to}>{label}</Breadcrumb.Item>
    );
  });

  // --------------------------
  // Render Breadcrumbs
  // --------------------------
  return (
    <div className="bg-white border-bottom">
      <div className="container py-2">
        <Breadcrumb className="mb-0">
          {/* Home link */}
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
          {/* Dynamic crumbs */}
          {crumbs}
        </Breadcrumb>
      </div>
    </div>
  );
}

// ------------------------------
// Export Component
// ------------------------------
export default Breadcrumbs;