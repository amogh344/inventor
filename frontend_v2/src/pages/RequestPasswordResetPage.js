// src/pages/RequestPasswordResetPage.js
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';

function RequestPasswordResetPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: '400px' }} className="shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">
            <i className="bi bi-key-fill me-2" /> Reset Password
          </h2>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Send Reset Link
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

export default RequestPasswordResetPage;