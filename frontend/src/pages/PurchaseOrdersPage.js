// src/pages/PurchaseOrdersPage.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPurchaseOrders, receivePurchaseOrder } from '../services/api';
import RoleRequired from '../components/RoleRequired';

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPurchaseOrders();
      setPurchaseOrders(response.data);
    } catch (err) {
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchaseOrders(); }, []);

  const handleReceiveOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to receive this order? This will add all items to stock.')) {
        try {
            await receivePurchaseOrder(orderId);
            fetchPurchaseOrders(); // Refresh the list
        } catch (err) {
            setError('Failed to receive order.');
        }
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Purchase Orders</h1>
        <RoleRequired allowedRoles={['Admin', 'Manager']}>
          <Button as={Link} to="/purchase-orders/create" variant="primary">Create Purchase Order</Button>
        </RoleRequired>
      </div>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {purchaseOrders.length === 0 && !loading && <Alert variant="info">No purchase orders found.</Alert>}

      {purchaseOrders.map((order) => (
        <Card className="mb-3" key={order.id}>
          <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
            <span>PO-{order.id} | Supplier: {order.supplier.name}</span>
            <Badge bg={order.status === 'Received' ? 'success' : 'warning'}>{order.status}</Badge>
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
                    <td>${item.unit_price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="text-end">
            <RoleRequired allowedRoles={['Admin', 'Manager']}>
              <Button 
                  variant="success" 
                  disabled={order.status === 'Received'}
                  onClick={() => handleReceiveOrder(order.id)}
              >
                  {order.status === 'Received' ? '✓ Received' : 'Mark as Received'}
              </Button>
            </RoleRequired>
          </Card.Footer>
        </Card>
      ))}
    </Container>
  );
}

export default PurchaseOrdersPage;