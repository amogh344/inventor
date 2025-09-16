/* ============================================================================
   IMPORTS
============================================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { getAuditLogs } from '../services/api';
import EmptyState from '../components/ui/EmptyState';

/* ============================================================================
   COMPONENT
============================================================================ */
function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ==========================================================================
     FETCH AUDIT LOGS
  ========================================================================== */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs();
      setLogs(response.data);
    } catch (err) {
      setError(
        'Failed to fetch audit logs. You may not have permission to view this page.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* ==========================================================================
     LOADING STATE
  ========================================================================== */
  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <Container className="my-4">
      {/* Page Header */}
      <div className="mb-3">
        <h2 className="fw-semibold mb-1">
          <i className="bi bi-person-lines-fill me-2 text-primary" /> Audit Trail
        </h2>
        <p className="text-muted mb-0">
          A log of all significant user actions in the system.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="There are no records available to display at the moment."
        />
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table
              striped
              hover
              responsive
              className="align-middle mb-0 table-sticky"
            >
              <thead className="table-light">
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Object</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user ? log.user.username : 'System'}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          log.action === 'CREATED'
                            ? 'bg-success'
                            : log.action === 'DELETED'
                            ? 'bg-danger'
                            : 'bg-secondary'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.object_repr}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

/* ============================================================================
   EXPORT
============================================================================ */
export default AuditTrailPage;