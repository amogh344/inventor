// frontend_v2/src/pages/SalesOrdersPage.js
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
import { getSalesOrders } from '../services/api';
import RoleRequired from '../components/RoleRequired';
import EmptyState from '../components/ui/EmptyState';
import SortDropdown from '../components/ui/SortDropdown';

function SalesOrdersPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('-order_date');

  const sortOptions = [
    { value: '-order_date', label: 'Newest First' },
    { value: 'order_date', label: 'Oldest First' },
    { value: 'customer_name', label: 'Customer Name (A-Z)' },
  ];

  /* ==========================================================================
     FETCH SALES ORDERS
  ========================================================================== */
  const fetchSalesOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ordering: sortOrder, search };
      const response = await getSalesOrders(params);
      setSalesOrders(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch sales orders.');
    } finally {
      setLoading(false);
    }
  }, [search, sortOrder]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handlePrintInvoice = (orderId) => {
    window.open(`/sales-orders/${orderId}/invoice`, '_blank');
  };

  /* ==========================================================================
     RENDER LOADING / ERROR STATES
  ========================================================================== */
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
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
            {/* Left: Title */}
            <div className="col-md-3 text-md-start text-center">
              <h3 className="mb-0 fw-semibold text-primary">
                <i className="bi bi-receipt me-2" /> Sales Orders
              </h3>
            </div>

            {/* Middle: Search */}
            <div className="col-md-4">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search sales orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0 rounded-end-pill"
                />
              </InputGroup>
            </div>

            {/* Right: Sort + Create */}
            <div className="col-md-5 d-flex justify-content-md-end justify-content-center gap-2">
              <SortDropdown
                options={sortOptions}
                value={sortOrder}
                onChange={setSortOrder}
              />
              <RoleRequired allowedRoles={['Admin', 'Manager']}>
                <Button
                  as={Link}
                  to="/sales-orders/create"
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
          {!loading && salesOrders.length === 0 ? (
            <EmptyState
              title="No sales orders found"
              description="Try adjusting your search or create a new sales order."
              action={
                <RoleRequired allowedRoles={['Admin', 'Manager']}>
                  <Button
                    as={Link}
                    to="/sales-orders/create"
                    variant="primary"
                    className="rounded-pill shadow-sm px-3 py-2"
                  >
                    <i className="bi bi-plus-lg me-2" /> Create Sales Order
                  </Button>
                </RoleRequired>
              }
            />
          ) : (
            salesOrders.map((order) => (
              <Card
                className="mb-3 shadow-sm border-0 rounded-3"
                key={order.id}
              >
                <Card.Header className="d-flex justify-content-between align-items-center bg-light fw-semibold">
                  <span>
                    SO-{order.id} | Customer: {order.customer_name || 'N/A'}
                  </span>
                  <Badge
                    bg={order.status === 'Fulfilled' ? 'success' : 'warning'}
                    className="px-3 py-2 rounded-pill"
                  >
                    {order.status}
                  </Badge>
                </Card.Header>

                <Card.Body>
                  <Card.Text>
                    <strong>Order Date:</strong>{' '}
                    {new Date(order.order_date).toLocaleDateString()}
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
                            <td>
                              {item.product.name} ({item.product.sku})
                            </td>
                            <td>{item.quantity}</td>
                            <td>₹{item.unit_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>

                <Card.Footer className="text-end bg-white border-0">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handlePrintInvoice(order.id)}
                    className="rounded-pill px-3 py-2"
                  >
                    <i className="bi bi-printer me-2" /> View Invoice
                  </Button>
                </Card.Footer>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SalesOrdersPage;