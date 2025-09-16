// src/pages/ReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Card,
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { getTransactions } from '../services/api';
import { CSVLink } from 'react-csv';

function ReportsPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    timestamp__gte: '',
    timestamp__lte: '',
    transaction_type: '',
  });

  const csvHeaders = [
    { label: 'Date', key: 'timestamp' },
    { label: 'Product', key: 'product.name' },
    { label: 'SKU', key: 'product.sku' },
    { label: 'Type', key: 'transaction_type' },
    { label: 'Quantity Change', key: 'quantity_change' },
    { label: 'Reason', key: 'reason' },
    { label: 'User', key: 'user.username' },
  ];

  /* ==========================================================================
     FETCHING
  ========================================================================== */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const response = await getTransactions(nonEmptyFilters);
      setTransactions(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <Container className="my-4">
      <Card className="shadow-sm border-0">

        {/* HEADER */}
        <Card.Header className="bg-white border-0">
          <h3 className="fw-semibold text-primary mb-0">
            <i className="bi bi-graph-up me-2" /> Transaction Reports
          </h3>
        </Card.Header>

        {/* FILTERS */}
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="timestamp__gte"
                    value={filters.timestamp__gte}
                    onChange={handleFilterChange}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="timestamp__lte"
                    value={filters.timestamp__lte}
                    onChange={handleFilterChange}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Select
                    name="transaction_type"
                    value={filters.transaction_type}
                    onChange={handleFilterChange}
                    className="rounded-pill"
                  >
                    <option value="">All</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Sale">Sale</option>
                    <option value="Adjustment">Adjustment</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-pill shadow-sm px-3 py-2 flex-fill d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-funnel me-2" /> Filter
                </Button>
                <CSVLink
                  data={transactions}
                  headers={csvHeaders}
                  filename={`inventory-report-${new Date().toISOString().slice(0, 10)}.csv`}
                  className="btn btn-success rounded-pill shadow-sm px-3 py-2 flex-fill d-flex align-items-center justify-content-center"
                  target="_blank"
                >
                  <i className="bi bi-download me-2" /> Export
                </CSVLink>
              </Col>
            </Row>
          </Form>
        </Card.Body>

        {/* TABLE */}
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
              {error}
            </Alert>
          ) : transactions.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-inbox fs-1 mb-3 d-block" />
              <p className="mb-0">No transactions found.</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mt-2 border rounded overflow-hidden shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty Change</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    <td>{tx.product.name}</td>
                    <td>{tx.transaction_type}</td>
                    <td className={tx.quantity_change > 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                      {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                    </td>
                    <td>{tx.reason}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>

      </Card>
    </Container>
  );
}

export default ReportsPage;