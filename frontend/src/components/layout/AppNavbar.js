import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AppNavbar() {
  const { user, logoutUser } = useAuth();
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Inventory System</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/products">Products</Nav.Link>
          <Nav.Link as={Link} to="/suppliers">Suppliers</Nav.Link>
          <Nav.Link as={Link} to="/purchase-orders">Purchase Orders</Nav.Link>
          <Nav.Link as={Link} to="/sales-orders">Sales Orders</Nav.Link>
          <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
        </Nav>
        <Nav>
          {user && (
            <NavDropdown title={user.username} id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logoutUser}>Logout</NavDropdown.Item>
            </NavDropdown>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
export default AppNavbar;