import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getSalesOrders } from '../services/api';
import RoleRequired from '../components/RoleRequired';

function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handlePrintInvoice = (orderId) => {
    // This function now simply opens the new invoice page in a new tab
    window.open(`/sales-orders/${orderId}/invoice`, '_blank');
  };
  
  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        const response = await getSalesOrders();
        setSalesOrders(response.data);
      } catch (err) {
        setError('Failed to fetch sales orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchSalesOrders();
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Sales Orders</h1>
        <RoleRequired allowedRoles={['Admin', 'Manager']}>
          <Button as={Link} to="/sales-orders/create" variant="primary">Create Sales Order</Button>
        </RoleRequired>
      </div>
      
      {salesOrders.map((order) => (
        <Card className="mb-3" key={order.id}>
          <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
             <span>SO-{order.id} | Customer: {order.customer_name || 'N/A'}</span>
             <Badge bg={order.status === 'Fulfilled' ? 'success' : 'warning'}>{order.status}</Badge>
          </Card.Header>
          <Card.Body>
            <Card.Text><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</Card.Text>
            <h6>Items:</h6>
            <Table striped bordered size="sm">
              <thead><tr><th>Product</th><th>Quantity</th><th>Unit Price</th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product.name} ({item.product.sku})</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unit_price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="text-end">
            <Button variant="outline-secondary" onClick={() => handlePrintInvoice(order.id)}>
                View Printable Invoice
            </Button>
          </Card.Footer>
        </Card>
      ))}
    </Container>
  );
}

export default SalesOrdersPage;