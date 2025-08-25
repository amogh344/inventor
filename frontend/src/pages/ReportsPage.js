import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Spinner, Alert, Card, Form, Row, Col, Button } from 'react-bootstrap';
import { getTransactions } from '../services/api';
import { CSVLink } from 'react-csv';

function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    timestamp__gte: '', 
    timestamp__lte: '', 
    transaction_type: '',
  });

  const csvHeaders = [
    { label: "Date", key: "timestamp" },
    { label: "Product", key: "product.name" },
    { label: "SKU", key: "product.sku" },
    { label: "Type", key: "transaction_type" },
    { label: "Quantity Change", key: "quantity_change" },
    { label: "Reason", key: "reason" },
    { label: "User", key: "user.username" },
  ];

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await getTransactions(nonEmptyFilters);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  }, [filters]); // Dependency on filters

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Run when fetchTransactions function changes

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = (e) => { e.preventDefault(); fetchTransactions(); };

  return (
    <Container>
      <h1 className="my-4">Transaction Reports</h1>
      <Card className="p-3 mb-4">
        <Form onSubmit={handleFilterSubmit}>
          <Row className="align-items-end">
            <Col md={3}><Form.Group><Form.Label>Start Date</Form.Label><Form.Control type="date" name="timestamp__gte" value={filters.timestamp__gte} onChange={handleFilterChange} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>End Date</Form.Label><Form.Control type="date" name="timestamp__lte" value={filters.timestamp__lte} onChange={handleFilterChange} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Transaction Type</Form.Label><Form.Select name="transaction_type" value={filters.transaction_type} onChange={handleFilterChange}><option value="">All</option><option value="Purchase">Purchase</option><option value="Sale">Sale</option><option value="Adjustment">Adjustment</option></Form.Select></Form.Group></Col>
            <Col md={3} className="d-flex gap-2">
              <Button type="submit" className="w-100">Filter</Button>
              <CSVLink
                data={transactions}
                headers={csvHeaders}
                filename={`inventory-report-${new Date().toISOString().slice(0, 10)}.csv`}
                className="btn btn-success w-100"
                target="_blank"
              >
                Export
              </CSVLink>
            </Col>
          </Row>
        </Form>
      </Card>

      {loading ? (<div className="text-center"><Spinner animation="border" /></div>) : 
       error ? (<Alert variant="danger">{error}</Alert>) : 
      (<Table striped bordered hover responsive>
          <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty Change</th><th>Reason</th></tr></thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td>{tx.product.name}</td>
                <td>{tx.transaction_type}</td>
                <td className={tx.quantity_change > 0 ? 'text-success' : 'text-danger'}>
                  <strong>{tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}</strong>
                </td>
                <td>{tx.reason}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ReportsPage;