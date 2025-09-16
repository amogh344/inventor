/* ============================================================================
   IMPORTS
============================================================================ */
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProducts, createSalesOrder } from '../services/api';

/* ============================================================================
   COMPONENT
============================================================================ */
function CreateSalesOrderPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1, unit_price: '' });
  const navigate = useNavigate();

  /* ==========================================================================
     FETCH PRODUCTS
  ========================================================================== */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRes = await getProducts();
        setProducts(productsRes.data);
      } catch {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      if (product.stock_quantity > 0) {
        setCurrentItem({ product: productId, quantity: 1, unit_price: product.unit_price });
      } else {
        alert(`${product.name} is out of stock.`);
        setCurrentItem({ product: '', quantity: 1, unit_price: '' });
      }
    }
  };

  const handleAddItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0) return;

    const product = products.find(p => p.id === parseInt(currentItem.product));
    if (currentItem.quantity > product.stock_quantity) {
      alert(`Not enough stock for ${product.name}. Available: ${product.stock_quantity}`);
      return;
    }

    setOrderItems([...orderItems, { ...currentItem, productName: product.name, sku: product.sku }]);
    setCurrentItem({ product: '', quantity: 1, unit_price: '' });
  };

  const handleRemoveItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    const orderData = {
      customer_name: customerName,
      status: 'Fulfilled',
      items: orderItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
    };

    try {
      await createSalesOrder(orderData);
      navigate('/sales-orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create sales order.');
    }
  };

  /* ==========================================================================
     LOADING STATE
  ========================================================================== */
  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
    </Container>
  );

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <Container>
      <div className="my-3">
        <div className="page-header d-flex justify-content-between align-items-center">
          <h1 className="mb-0"><i className="bi bi-receipt-cutoff" /> Create Sales Order</h1>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="p-4">
        {/* Customer Name */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Customer Name</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Col>
        </Form.Group>

        <hr />

        {/* Add Items */}
        <h4 className="mt-4">Add Items</h4>
        <Row className="align-items-end g-3">
          <Col md={5}>
            <Form.Label>Product</Form.Label>
            <Form.Select value={currentItem.product} onChange={(e) => handleProductSelect(e.target.value)}>
              <option value="">Select a Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (In Stock: {p.stock_quantity})
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
              min="1"
            />
          </Col>

          <Col md={3}>
            <Form.Label>Unit Price</Form.Label>
            <Form.Control
              type="number"
              value={currentItem.unit_price}
              onChange={(e) => setCurrentItem({ ...currentItem, unit_price: e.target.value })}
              placeholder="Unit Price"
            />
          </Col>

          <Col md={2}>
            <Button onClick={handleAddItem} className="w-100">Add Item</Button>
          </Col>
        </Row>

        {/* Order Items Table */}
        <h4 className="mt-5">Order Items</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
                <td>${item.unit_price}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-4 text-end">
          <Button variant="success" size="lg" onClick={handleSubmit}>Submit Order</Button>
        </div>
      </Card>
    </Container>
  );
}

/* ============================================================================
   EXPORT
============================================================================ */
export default CreateSalesOrderPage;