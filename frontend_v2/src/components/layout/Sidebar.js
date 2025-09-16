// src/components/layout/Sidebar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar-inner">
      <div className="sidebar-brand">Inventory</div>
      <Nav className="flex-column">
        <Nav.Link as={Link} to="/" active={isActive('/')}>Dashboard</Nav.Link>
        <Nav.Link as={Link} to="/products" active={isActive('/products')}>Products</Nav.Link>
        <Nav.Link as={Link} to="/suppliers" active={isActive('/suppliers')}>Suppliers</Nav.Link>
        <Nav.Link as={Link} to="/purchase-orders" active={isActive('/purchase-orders')}>Purchase Orders</Nav.Link>
        <Nav.Link as={Link} to="/sales-orders" active={isActive('/sales-orders')}>Sales Orders</Nav.Link>
        <Nav.Link as={Link} to="/reports" active={isActive('/reports')}>Reports</Nav.Link>
        <div className="mt-3 small text-muted px-3">Account</div>
        <Nav.Link as={Link} to="/profile" active={isActive('/profile')}>Profile</Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;