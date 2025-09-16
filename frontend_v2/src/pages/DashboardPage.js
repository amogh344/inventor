// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table,
  Badge,
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';

function DashboardPage() {
  /* ==========================================================================
     CONTEXT & STATE
  ========================================================================== */
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ==========================================================================
     FETCH DASHBOARD STATS
  ========================================================================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* ==========================================================================
     LOADING & ERROR STATES
  ========================================================================== */
  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );

  if (error)
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  /* ==========================================================================
     RENDER DASHBOARD
  ========================================================================== */
  return (
    <Container className="my-4">

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-semibold mb-1">
            <i className="bi bi-speedometer2 me-2 text-primary" /> Dashboard
          </h2>
          <div className="text-muted">
            Welcome back, <strong>{user.username}</strong>!
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <Card.Text className="fs-2 fw-bold text-primary">
                {stats?.total_products}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Card.Title>Low Stock Items</Card.Title>
              <Card.Text className="fs-2 fw-bold text-danger">
                {stats?.low_stock_items.length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 text-center h-100">
            <Card.Body>
              <Card.Title>Recent Transactions</Card.Title>
              <Card.Text className="fs-2 fw-bold text-success">
                {stats?.recent_transactions.length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row className="g-4">

        {/* Low Stock Table */}
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-semibold">
              <i className="bi bi-exclamation-triangle text-warning me-2" />
              Low Stock Alerts
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0 border-top">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>In Stock</th>
                    <th>Min Level</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.low_stock_items.length > 0 ? (
                    stats.low_stock_items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <Badge bg="danger" className="rounded-pill">
                            {item.stock_quantity}
                          </Badge>
                        </td>
                        <td>{item.min_stock_level}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        <i className="bi bi-check-circle me-2" />
                        No items are low on stock.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Transactions Table */}
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-semibold">
              <i className="bi bi-clock-history text-info me-2" />
              Recent Transactions
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0 border-top">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty Change</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_transactions.length > 0 ? (
                    stats.recent_transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.product.name}</td>
                        <td>
                          <Badge
                            bg={tx.transaction_type === 'Sale' ? 'danger' : 'success'}
                            className="rounded-pill"
                          >
                            {tx.transaction_type}
                          </Badge>
                        </td>
                        <td
                          className={
                            tx.quantity_change > 0
                              ? 'text-success fw-semibold'
                              : 'text-danger fw-semibold'
                          }
                        >
                          {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        <i className="bi bi-inbox me-2" />
                        No recent transactions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;