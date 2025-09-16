import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ------------------------------
// AppNavbar Component
// Main navigation bar for the app
// ------------------------------
function AppNavbar() {
  // --------------------------
  // Auth context
  // --------------------------
  const { user, logoutUser } = useAuth();

  // --------------------------
  // Render Navbar
  // --------------------------
  return (
    <Navbar bg="light" variant="light" expand="lg" className="app-navbar sticky-top">
      <Container fluid>
        {/* Brand / Logo */}
        <div className="d-flex align-items-center gap-2">
          <Navbar.Brand as={Link} to="/">
            <i className="bi bi-box-seam me-2" />Inventory Pro
          </Navbar.Brand>
        </div>

        {/* Toggle for mobile */}
        <Navbar.Toggle aria-controls="main-nav" />

        {/* Navigation Links */}
        <Navbar.Collapse id="main-nav">
          {/* Left: Main navigation */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/suppliers">Suppliers</Nav.Link>
            <Nav.Link as={Link} to="/purchase-orders">Purchase Orders</Nav.Link>
            <Nav.Link as={Link} to="/sales-orders">Sales Orders</Nav.Link>
            <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
            <Nav.Link as={Link} to="/audit-trail">Audit Trail</Nav.Link> 
          </Nav>

          {/* Right: User menu */}
          <Nav>
            {user && (
              <NavDropdown title={user.username} align="end" id="user-menu">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutUser}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// ------------------------------
// Export Component
// ------------------------------
export default AppNavbar;