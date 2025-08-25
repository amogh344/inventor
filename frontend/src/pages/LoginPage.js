import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser as apiLogin } from '../services/api'; // Correct path
import { useAuth } from '../context/AuthContext'; // Correct path
import { jwtDecode } from 'jwt-decode';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiLogin(username, password);
      const { access } = response.data;
      
      loginUser(response.data);
      const decodedUser = jwtDecode(access);

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

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Form.Group>
                <div className="d-grid"><Button variant="primary" type="submit">Log In</Button></div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <div>
                Don't have an account? <Link to="/register">Register Here</Link>
              </div>
              <div className="mt-2">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;