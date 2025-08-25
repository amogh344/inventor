// src/pages/CreatePurchaseOrderPage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, getProducts, createPurchaseOrder } from '../services/api';

function CreatePurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1, unit_price: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([getSuppliers(), getProducts()]);
        setSuppliers(suppliersRes.data);
        setProducts(productsRes.data);
      } catch (err) { setError('Failed to load necessary data.'); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) setCurrentItem({ product: productId, quantity: 1, unit_price: product.unit_price });
  };

  const handleAddItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0) return;
    const product = products.find(p => p.id === parseInt(currentItem.product));
    setOrderItems([...orderItems, { ...currentItem, productName: product.name, sku: product.sku }]);
    setCurrentItem({ product: '', quantity: 1, unit_price: '' });
  };
  
  const handleRemoveItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!selectedSupplier || orderItems.length === 0) {
      alert('Please select a supplier and add at least one item.');
      return;
    }
    const orderData = {
      supplier: selectedSupplier,
      status: 'Pending',
      items: orderItems.map(item => ({ product: item.product, quantity: item.quantity, unit_price: item.unit_price }))
    };
    try {
      await createPurchaseOrder(orderData);
      navigate('/purchase-orders');
    } catch (err) { setError('Failed to create purchase order.'); }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container>
      <h1 className="my-4">Create Purchase Order</h1>
      <Card className="p-4">
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Supplier</Form.Label>
          <Col sm={10}><Form.Select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} required><option value="">Select a Supplier</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Form.Select></Col>
        </Form.Group>
        <hr />
        <h4 className="mt-4">Add Items</h4>
        <Row className="align-items-end g-3">
            <Col md={5}><Form.Label>Product</Form.Label><Form.Select value={currentItem.product} onChange={(e) => handleProductSelect(e.target.value)}><option value="">Select a Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</Form.Select></Col>
            <Col md={2}><Form.Label>Quantity</Form.Label><Form.Control type="number" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} min="1"/></Col>
            <Col md={3}><Form.Label>Unit Price</Form.Label><Form.Control type="number" value={currentItem.unit_price} onChange={(e) => setCurrentItem({...currentItem, unit_price: e.target.value})} placeholder="Unit Price" /></Col>
            <Col md={2}><Button onClick={handleAddItem} className="w-100">Add Item</Button></Col>
        </Row>
        <h4 className="mt-5">Order Items</h4>
        <Table striped bordered hover>
          <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Unit Price</th><th>Action</th></tr></thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}><td>{item.productName}</td><td>{item.sku}</td><td>{item.quantity}</td><td>${item.unit_price}</td><td><Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>Remove</Button></td></tr>
            ))}
          </tbody>
        </Table>
        <div className="mt-4 text-end"><Button variant="success" size="lg" onClick={handleSubmit}>Submit Order</Button></div>
      </Card>
    </Container>
  );
}

export default CreatePurchaseOrderPage;