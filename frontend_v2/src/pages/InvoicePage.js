// src/pages/InvoicePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Table, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { getSalesOrderById } from '../services/api';
import '../components/Invoice.css';

function InvoicePage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  /* ==========================================================================
     FETCH SALES ORDER BY ID
  ========================================================================== */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getSalesOrderById(id);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch invoice data. The order may not exist.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

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
        <Alert variant="danger">
          {error} <Link to="/sales-orders">Go back</Link>
        </Alert>
      </Container>
    );

  if (!order) return null;

  /* ==========================================================================
     CALCULATION LOGIC
  ========================================================================== */
  const subtotal = order.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  /* ==========================================================================
     RENDER INVOICE
  ========================================================================== */
  return (
    <div className="invoice-container">

      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">INVOICE</h1>
          <p className="text-muted">InventorPRO</p>
        </Col>
        <Col className="text-end">
          <p className="mb-0"><strong>Order #:</strong> SO-{order.id}</p>
          <p className="mb-0"><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
        </Col>
      </Row>

      <hr />

      {/* Bill To */}
      <Row className="mb-4">
        <Col>
          <strong>Bill To:</strong>
          <p className="mb-0">{order.customer_name || 'Valued Customer'}</p>
        </Col>
      </Row>

      {/* Items Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product.name}</td>
              <td>{item.product.sku}</td>
              <td>{item.quantity}</td>
              <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
              <td>₹{(item.quantity * item.unit_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Summary */}
      <Row className="mt-4 justify-content-end">
        <Col md={4}>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td className="text-end">₹{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Tax ({(taxRate * 100).toFixed(0)}%):</strong></td>
                <td className="text-end">₹{tax.toFixed(2)}</td>
              </tr>
              <tr className="border-top">
                <td className="pt-2"><strong>Total:</strong></td>
                <td className="text-end pt-2"><strong>₹{total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
}

export default InvoicePage;