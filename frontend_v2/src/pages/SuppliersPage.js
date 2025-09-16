// frontend_v2/src/pages/SuppliersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Card,
  ButtonGroup,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import SupplierFormModal from '../components/SupplierFormModal';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/ToastProvider';
import SortDropdown from '../components/ui/SortDropdown';
import RoleRequired from '../components/RoleRequired';

function SuppliersPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('name');

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: '-id', label: 'Most Recent' },
  ];

  /* ==========================================================================
     FETCH SUPPLIERS
  ========================================================================== */
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ordering: sortOrder, search };
      const response = await getSuppliers(params);
      setSuppliers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch suppliers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  /* ==========================================================================
     MODAL HANDLERS
  ========================================================================== */
  const handleShowCreateModal = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleShowEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSupplier(null);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, formData);
        showToast({ variant: 'success', message: 'Supplier updated' });
      } else {
        await createSupplier(formData);
        showToast({ variant: 'success', message: 'Supplier created' });
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (err) {
      setError(selectedSupplier ? 'Failed to update supplier.' : 'Failed to create supplier.');
      showToast({ variant: 'danger', message: 'Action failed' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await deleteSupplier(id);
        showToast({ variant: 'success', message: 'Supplier deleted' });
        fetchSuppliers();
      } catch (err) {
        setError('Failed to delete supplier. It might be linked to existing purchase orders.');
        showToast({ variant: 'danger', message: 'Deletion failed' });
      }
    }
  };

  /* ==========================================================================
     RENDER LOADING
  ========================================================================== */
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  /* ==========================================================================
     RENDER PAGE
  ========================================================================== */
  return (
    <Container className="my-4">
      <Card className="shadow-sm border-0">
        {/* HEADER */}
        <Card.Header className="bg-white border-0 pb-0">
          <div className="row align-items-center g-3">
            {/* Title */}
            <div className="col-md-3 text-md-start text-center">
              <h3 className="mb-0 fw-semibold text-primary">
                <i className="bi bi-people me-2" /> Suppliers
              </h3>
            </div>

            {/* Search */}
            <div className="col-md-4">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search suppliers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 rounded-end-pill"
                />
              </InputGroup>
            </div>

            {/* Sort + Create */}
            <div className="col-md-5 d-flex justify-content-md-end justify-content-center gap-2">
              <SortDropdown options={sortOptions} value={sortOrder} onChange={setSortOrder} />
              <RoleRequired allowedRoles={['Admin', 'Manager']}>
                <Button
                  variant="primary"
                  onClick={handleShowCreateModal}
                  className="rounded-pill shadow-sm px-3 py-2 d-flex align-items-center"
                >
                  <i className="bi bi-plus-lg me-2" /> Create
                </Button>
              </RoleRequired>
            </div>
          </div>
        </Card.Header>

        {/* BODY */}
        <Card.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {!loading && suppliers.length === 0 ? (
            <EmptyState
              title="No suppliers found"
              description="Try adjusting your search or create a new supplier."
              action={
                <RoleRequired allowedRoles={['Admin', 'Manager']}>
                  <Button
                    variant="primary"
                    onClick={handleShowCreateModal}
                    className="rounded-pill shadow-sm px-3 py-2"
                  >
                    <i className="bi bi-plus-lg me-2" /> Create Supplier
                  </Button>
                </RoleRequired>
              }
            />
          ) : (
            <Table
              hover
              responsive
              className="align-middle mt-3 border rounded overflow-hidden shadow-sm"
            >
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="fw-medium">{supplier.name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleShowEditModal(supplier)}
                          title="Edit supplier"
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleDelete(supplier.id)}
                          title="Delete supplier"
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL */}
      <SupplierFormModal
        show={showModal}
        handleClose={handleCloseModal}
        supplier={selectedSupplier}
        onSave={handleSave}
      />
    </Container>
  );
}

export default SuppliersPage;