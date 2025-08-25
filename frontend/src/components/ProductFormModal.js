// src/components/ProductFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ProductFormModal({ show, handleClose, product, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ name: '', sku: '', category: '', unit_price: '', stock_quantity: '', min_stock_level: '' });
    }
  }, [product, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton><Modal.Title>{product ? 'Edit Product' : 'Create Product'}</Modal.Title></Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>SKU</Form.Label><Form.Control type="text" name="sku" value={formData.sku || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Category</Form.Label><Form.Control type="text" name="category" value={formData.category || ''} onChange={handleChange} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Unit Price</Form.Label><Form.Control type="number" name="unit_price" value={formData.unit_price || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Stock Quantity</Form.Label><Form.Control type="number" name="stock_quantity" value={formData.stock_quantity || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Minimum Stock Level</Form.Label><Form.Control type="number" name="min_stock_level" value={formData.min_stock_level || ''} onChange={handleChange} required /></Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" type="submit">Save Changes</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ProductFormModal;