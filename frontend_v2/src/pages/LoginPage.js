// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function LoginPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  /* ==========================================================================
     HANDLE LOGIN SUBMISSION
  ========================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiLogin(username, password);
      const { access } = response.data;

      // Save tokens in AuthContext
      loginUser(response.data);

      const decodedUser = jwtDecode(access);

      // Redirect based on role
      if (decodedUser.role === 'Admin') {
        window.location.href = 'http://127.0.0.1:8000/admin/';
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

  /* ==========================================================================
     RENDER LOGIN FORM
  ========================================================================== */
  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Card.Body>
          {/* Header */}
          <div className="text-center mb-3">
            <i className="bi bi-box-seam fs-1 text-primary" />
            <h2 className="mt-2 mb-0">Welcome back</h2>
            <div className="text-muted">Sign in to Inventory Pro</div>
          </div>

          {/* Error Message */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Login Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Log In
              </Button>
            </div>
          </Form>
        </Card.Body>

        {/* Footer Links */}
        <Card.Footer className="text-center">
          <div>
            Don't have an account? <Link to="/register">Register Here</Link>
          </div>
          <div className="mt-2">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default LoginPage;