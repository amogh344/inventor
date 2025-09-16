// frontend_v2/src/pages/PurchaseOrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Spinner,
  Alert,
  Button,
  Card,
  Badge,
  Table,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPurchaseOrders, receivePurchaseOrder } from '../services/api';
import RoleRequired from '../components/RoleRequired';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/ToastProvider';
import SortDropdown from '../components/ui/SortDropdown';

function PurchaseOrdersPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('-order_date');

  const sortOptions = [
    { value: '-order_date', label: 'Newest First' },
    { value: 'order_date', label: 'Oldest First' },
  ];

  /* ==========================================================================
     FETCH PURCHASE ORDERS
  ========================================================================== */
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ordering: sortOrder, search };
      const response = await getPurchaseOrders(params);
      setPurchaseOrders(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  }, [search, sortOrder]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleReceiveOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to receive this order? This will add all items to stock.')) {
      try {
        await receivePurchaseOrder(orderId);
        showToast({ variant: 'success', message: 'Purchase order received' });
        fetchPurchaseOrders();
      } catch (err) {
        setError('Failed to receive order.');
        showToast({ variant: 'danger', message: 'Failed to receive order' });
      }
    }
  };

  /* ==========================================================================
     LOADING STATE
  ========================================================================== */
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

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
                <i className="bi bi-bag-check me-2" /> Purchase Orders
              </h3>
            </div>

            {/* Middle: Search */}
            <div className="col-md-4">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search purchase orders..."
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
                  as={Link}
                  to="/purchase-orders/create"
                  variant="primary"
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
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!loading && purchaseOrders.length === 0 ? (
            <EmptyState
              title="No purchase orders found"
              description="Try adjusting your search or create a new purchase order."
              action={
                <RoleRequired allowedRoles={['Admin', 'Manager']}>
                  <Button
                    as={Link}
                    to="/purchase-orders/create"
                    variant="primary"
                    className="rounded-pill shadow-sm px-3 py-2"
                  >
                    <i className="bi bi-plus-lg me-2" /> Create Purchase Order
                  </Button>
                </RoleRequired>
              }
            />
          ) : (
            /* Purchase Orders List */
            <>
              {purchaseOrders.map((order) => (
                <Card key={order.id} className="mb-3 shadow-sm border-0 rounded-3">

                  {/* Order Header */}
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light fw-semibold">
                    <span>
                      PO-{order.id} | Supplier: {order.supplier.name}
                    </span>
                    <Badge
                      bg={order.status === 'Received' ? 'success' : 'warning'}
                      className="px-3 py-2 rounded-pill"
                    >
                      {order.status}
                    </Badge>
                  </Card.Header>

                  {/* Order Body */}
                  <Card.Body>
                    <Card.Text>
                      <strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}
                    </Card.Text>
                    <h6 className="fw-semibold">Items:</h6>
                    <div className="table-scroll">
                      <Table
                        hover
                        responsive
                        size="sm"
                        className="align-middle mt-2 border rounded overflow-hidden shadow-sm"
                      >
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.product.name} ({item.product.sku})</td>
                              <td>{item.quantity}</td>
                              <td>${item.unit_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>

                  {/* Order Footer */}
                  <Card.Footer className="text-end bg-white border-0">
                    <RoleRequired allowedRoles={['Admin', 'Manager']}>
                      <Button
                        variant="success"
                        disabled={order.status === 'Received'}
                        onClick={() => handleReceiveOrder(order.id)}
                        className="rounded-pill px-3 py-2"
                      >
                        {order.status === 'Received' ? '✓ Received' : 'Mark as Received'}
                      </Button>
                    </RoleRequired>
                  </Card.Footer>
                </Card>
              ))}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PurchaseOrdersPage;