import React from 'react';
import { Table, Row, Col, Container } from 'react-bootstrap';

const InvoiceComponent = React.forwardRef(({ order }, ref) => {
  if (!order) {
    return null;
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div ref={ref} className="p-5">
      <Container>
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0">INVOICE</h1>
            <p className="text-muted">Your Company Name</p>
          </Col>
          <Col className="text-end">
            <p className="mb-0"><strong>Order #:</strong> SO-{order.id}</p>
            <p className="mb-0"><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
          </Col>
        </Row>
        <hr />
        <Row className="mb-4">
          <Col>
            <strong>Bill To:</strong>
            <p className="mb-0">{order.customer_name || 'Valued Customer'}</p>
          </Col>
        </Row>
        <Table striped bordered hover responsive>
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
      </Container>
    </div>
  );
});

export default InvoiceComponent;