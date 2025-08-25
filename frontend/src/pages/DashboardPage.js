// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container>
      <h1 className="my-4">Dashboard</h1>
      <p>Welcome back, <strong>{user.username}</strong>!</p>
      
      <Row>
        <Col md={4}><Card className="text-center mb-3"><Card.Body><Card.Title>Total Products</Card.Title><Card.Text className="fs-2">{stats?.total_products}</Card.Text></Card.Body></Card></Col>
        <Col md={4}><Card className="text-center mb-3"><Card.Body><Card.Title>Low Stock Items</Card.Title><Card.Text className="fs-2 text-danger">{stats?.low_stock_items.length}</Card.Text></Card.Body></Card></Col>
      </Row>

      <Row>
        <Col md={6}>
          <h4 className="mt-5">Low Stock Alerts</h4>
          <Card>
            <Table responsive striped hover className="mb-0">
              <thead><tr><th>Product</th><th>In Stock</th><th>Min Level</th></tr></thead>
              <tbody>
                {stats?.low_stock_items.length > 0 ? (
                  stats.low_stock_items.map(item => (
                    <tr key={item.id}><td>{item.name}</td><td><Badge bg="danger">{item.stock_quantity}</Badge></td><td>{item.min_stock_level}</td></tr>
                  ))
                ) : ( <tr><td colSpan="3" className="text-center">No items are low on stock.</td></tr> )}
              </tbody>
            </Table>
          </Card>
        </Col>
        <Col md={6}>
          <h4 className="mt-5">Recent Transactions</h4>
          <Card>
            <Table responsive striped hover className="mb-0">
              <thead><tr><th>Product</th><th>Type</th><th>Qty Change</th></tr></thead>
              <tbody>
                {stats?.recent_transactions.length > 0 ? (
                  stats.recent_transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.product.name}</td>
                      <td><Badge bg={tx.transaction_type === 'Sale' ? 'danger' : 'success'}>{tx.transaction_type}</Badge></td>
                      <td className={tx.quantity_change > 0 ? 'text-success' : 'text-danger'}>
                        {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                      </td>
                    </tr>
                  ))
                ) : ( <tr><td colSpan="3" className="text-center">No recent transactions.</td></tr> )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;