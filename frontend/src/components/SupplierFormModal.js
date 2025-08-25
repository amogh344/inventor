// src/components/SupplierFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function SupplierFormModal({ show, handleClose, supplier, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({ name: '', email: '', phone: '', contact_info: '' });
    }
  }, [supplier, show]);

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
      <Modal.Header closeButton><Modal.Title>{supplier ? 'Edit Supplier' : 'Create Supplier'}</Modal.Title></Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Phone</Form.Label><Form.Control type="text" name="phone" value={formData.phone || ''} onChange={handleChange} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Contact Info (Address)</Form.Label><Form.Control as="textarea" rows={3} name="contact_info" value={formData.contact_info || ''} onChange={handleChange} /></Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" type="submit">Save Changes</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default SupplierFormModal;
