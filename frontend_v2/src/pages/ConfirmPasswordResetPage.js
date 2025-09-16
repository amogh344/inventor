/* ============================================================================
   IMPORTS
============================================================================ */
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../services/api';

/* ============================================================================
   COMPONENT
============================================================================ */
function ConfirmPasswordResetPage() {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  /* ==========================================================================
     FORM SUBMISSION
  ========================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await confirmPasswordReset(token, password);
      setMessage('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Invalid or expired token. Please request a new password reset.');
    }
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Set New Password</h2>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Reset Password
              </Button>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="text-center">
          <Link to="/login">Back to Login</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
}

/* ============================================================================
   EXPORT
============================================================================ */
export default ConfirmPasswordResetPage;