// src/pages/SuppliersPage.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import SupplierFormModal from '../components/SupplierFormModal';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = async () => {
    try { setLoading(true); const response = await getSuppliers(); setSuppliers(response.data); setError(''); } 
    catch (err) { setError('Failed to fetch suppliers.'); console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleShowCreateModal = () => { setSelectedSupplier(null); setShowModal(true); };
  const handleShowEditModal = (supplier) => { setSelectedSupplier(supplier); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedSupplier(null); };

  const handleSave = async (formData) => {
    try {
      if (selectedSupplier) { await updateSupplier(selectedSupplier.id, formData); } 
      else { await createSupplier(formData); }
      fetchSuppliers(); handleCloseModal();
    } catch (err) { setError(selectedSupplier ? 'Failed to update supplier.' : 'Failed to create supplier.'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try { await deleteSupplier(id); fetchSuppliers(); } 
      catch (err) { setError('Failed to delete supplier.'); }
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Suppliers</h1>
        <Button variant="primary" onClick={handleShowCreateModal}>Create Supplier</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td><td>{supplier.email}</td><td>{supplier.phone}</td>
              <td>
                <ButtonGroup>
                  <Button variant="outline-secondary" size="sm" onClick={() => handleShowEditModal(supplier)}>Edit</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(supplier.id)}>Delete</Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <SupplierFormModal show={showModal} handleClose={handleCloseModal} supplier={selectedSupplier} onSave={handleSave} />
    </Container>
  );
}

export default SuppliersPage;