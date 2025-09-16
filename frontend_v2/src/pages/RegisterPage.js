// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function RegisterPage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'Staff', // Default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await registerUser(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const messages = Object.keys(errorData)
          .map((key) => `${key}: ${errorData[key]}`)
          .join(' ');
        setError(messages || 'Failed to register.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */
  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Card.Body>
          {/* Header */}
          <div className="text-center mb-3">
            <i className="bi bi-person-plus fs-1 text-primary" />
            <h2 className="mt-2 mb-0">Create an account</h2>
            <div className="text-muted">Join Inventory Pro</div>
          </div>

          {/* Alerts */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="first_name" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="last_name" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" name="password2" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">Register</Button>
            </div>
          </Form>
        </Card.Body>

        {/* Footer */}
        <Card.Footer className="text-center">
          Already have an account? <Link to="/login">Log In</Link>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default RegisterPage;