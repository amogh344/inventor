// src/pages/ProductsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Card,
  ButtonGroup,
  Badge,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { useToast } from '../components/ui/ToastProvider';
import { getProducts, createProduct, updateProduct, patchProduct } from '../services/api';
import ProductFormModal from '../components/ProductFormModal';
import RoleRequired from '../components/RoleRequired';
import SortDropdown from '../components/ui/SortDropdown';
import EmptyState from '../components/ui/EmptyState';

function ProductsPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('-id');
  const { showToast } = useToast();

  /* ==========================================================================
     SORT OPTIONS
  ========================================================================== */
  const sortOptions = [
    { value: '-id', label: 'Most Recent' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: '-stock_quantity', label: 'Stock (High-Low)' },
    { value: 'stock_quantity', label: 'Stock (Low-High)' },
  ];

  /* ==========================================================================
     FETCH PRODUCTS
  ========================================================================== */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ordering: sortOrder, search };
      const response = await getProducts(params);
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ==========================================================================
     MODAL HANDLERS
  ========================================================================== */
  const handleShowCreateModal = () => { setSelectedProduct(null); setShowModal(true); };
  const handleShowEditModal = (product) => { setSelectedProduct(product); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedProduct(null); };

  /* ==========================================================================
     SAVE PRODUCT (CREATE OR UPDATE)
  ========================================================================== */
  const handleSave = async (formData) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
        showToast({ variant: 'success', message: 'Product updated' });
      } else {
        await createProduct(formData);
        showToast({ variant: 'success', message: 'Product created' });
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError(selectedProduct ? 'Failed to update product.' : 'Failed to create product.');
      showToast({ variant: 'danger', message: 'Action failed' });
    }
  };

  /* ==========================================================================
     ARCHIVE PRODUCT
  ========================================================================== */
  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this product? It will be hidden from lists and new orders.')) {
      try {
        await patchProduct(id, { is_active: false });
        showToast({ variant: 'success', message: 'Product archived successfully' });
        fetchProducts();
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Failed to archive product.';
        setError(errorMessage);
        showToast({ variant: 'danger', message: 'Action failed' });
      }
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
    <Container className="my-4">
      <Card className="shadow-sm border-0">
        {/* HEADER */}
        <Card.Header className="bg-white border-0 pb-0">
          <div className="row align-items-center g-3">
            {/* Left: Title */}
            <div className="col-md-3 text-md-start text-center">
              <h3 className="mb-0 fw-semibold text-primary">
                <i className="bi bi-box-seam me-2" /> Products
              </h3>
            </div>

            {/* Middle: Search Bar */}
            <div className="col-md-4">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 rounded-end-pill"
                />
              </InputGroup>
            </div>

            {/* Right: Sort + Create */}
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

          {!loading && products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or create a new product."
              action={
                <RoleRequired allowedRoles={['Admin', 'Manager']}>
                  <Button
                    variant="primary"
                    onClick={handleShowCreateModal}
                    className="rounded-pill shadow-sm px-3 py-2"
                  >
                    <i className="bi bi-plus-lg me-2" /> Create Product
                  </Button>
                </RoleRequired>
              }
            />
          ) : (
            <Table hover responsive className="align-middle mt-3 border rounded overflow-hidden shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <RoleRequired allowedRoles={['Admin', 'Manager']}>
                    <th className="text-center">Actions</th>
                  </RoleRequired>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => [p.sku, p.name].join(' ').toLowerCase().includes(search.toLowerCase()))
                  .map((product) => (
                    <tr key={product.id}>
                      <td className="fw-medium">{product.sku}</td>
                      <td>{product.name}</td>
                      <td>
                        {product.stock_quantity > 0 ? (
                          <Badge bg="success" pill>{product.stock_quantity} in stock</Badge>
                        ) : (
                          <Badge bg="danger" pill>Out of stock</Badge>
                        )}
                      </td>
                      <RoleRequired allowedRoles={['Admin', 'Manager']}>
                        <td className="text-center">
                          <ButtonGroup size="sm">
                            <Button variant="outline-secondary" onClick={() => handleShowEditModal(product)} title="Edit product">
                              <i className="bi bi-pencil" />
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleArchive(product.id)} title="Archive product">
                              <i className="bi bi-archive" />
                            </Button>
                          </ButtonGroup>
                        </td>
                      </RoleRequired>
                    </tr>
                  ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL */}
      <ProductFormModal
        show={showModal}
        handleClose={handleCloseModal}
        product={selectedProduct}
        onSave={handleSave}
      />
    </Container>
  );
}

export default ProductsPage;