// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { getProducts, createProduct, updateProduct, deleteProduct, getQRCode} from '../services/api';
import ProductFormModal from '../components/ProductFormModal';
import RoleRequired from '../components/RoleRequired';
import AuthenticatedImage from '../components/AuthenticatedImage'; // Import our new component



function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try { setLoading(true); const response = await getProducts(); setProducts(response.data); setError(''); } 
    catch (err) { setError('Failed to fetch products.'); console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleShowCreateModal = () => { setSelectedProduct(null); setShowModal(true); };
  const handleShowEditModal = (product) => { setSelectedProduct(product); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedProduct(null); };

  const handleSave = async (formData) => {
    try {
      if (selectedProduct) { await updateProduct(selectedProduct.id, formData); } 
      else { await createProduct(formData); }
      fetchProducts(); handleCloseModal();
    } catch (err) { setError(selectedProduct ? 'Failed to update product.' : 'Failed to create product.'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try { await deleteProduct(id); fetchProducts(); } 
      catch (err) { setError('Failed to delete product.'); }
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

//     <Container>
//       <div className="d-flex justify-content-between align-items-center my-4">
//         <h1>Products</h1>
//         <RoleRequired allowedRoles={['Admin', 'Manager']}>
//             <Button variant="primary" onClick={handleShowCreateModal}>Create Product</Button>
//         </RoleRequired>
//       </div>
//       {error && <Alert variant="danger">{error}</Alert>}
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>SKU</th><th>Name</th><th>Barcode</th><th>Stock</th>
//             <RoleRequired allowedRoles={['Admin', 'Manager']}>
//                 <th>Actions</th>
//             </RoleRequired>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((product) => (
//             <tr key={product.id}>
//               <td>{product.sku}</td>
//               <td>{product.name}</td>
//               <td>
//                 <AuthenticatedImage 
//                   fetchImage={() => getBarcode(product.sku)}
//                   alt={`Barcode for ${product.sku}`}
//                   style={{ height: '40px' }}
//                 />
//               </td>
//               <td>{product.stock_quantity}</td>
//               <RoleRequired allowedRoles={['Admin', 'Manager']}>
//                 <td>
//                     <ButtonGroup>
//                     <Button variant="outline-secondary" size="sm" onClick={() => handleShowEditModal(product)}>Edit</Button>
//                     <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
//                     </ButtonGroup>
//                 </td>
//               </RoleRequired>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//       <ProductFormModal show={showModal} handleClose={handleCloseModal} product={selectedProduct} onSave={handleSave} />
//     </Container>

return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Products</h1>
        <RoleRequired allowedRoles={['Admin', 'Manager']}>
          <Button variant="primary" onClick={handleShowCreateModal}>Create Product</Button>
        </RoleRequired>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>QR Code</th>
            <th>Stock</th>
            <RoleRequired allowedRoles={['Admin', 'Manager']}>
                <th>Actions</th>
            </RoleRequired>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>
                <AuthenticatedImage 
                  fetchImage={() => getQRCode(product.sku)}
                  alt={`QR Code for ${product.sku}`}
                  style={{ height: '50px', width: '50px' }}
                />
              </td>
              <td>{product.stock_quantity}</td>
              <RoleRequired allowedRoles={['Admin', 'Manager']}>
                <td>
                    <ButtonGroup>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleShowEditModal(product)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
                    </ButtonGroup>
                </td>
              </RoleRequired>
            </tr>
          ))}
        </tbody>
      </Table>
      <ProductFormModal show={showModal} handleClose={handleCloseModal} product={selectedProduct} onSave={handleSave} />
    </Container>
  );
}

export default ProductsPage;