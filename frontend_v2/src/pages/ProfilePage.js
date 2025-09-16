// src/features/auth/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  /* ==========================================================================
     STATE
  ========================================================================== */
  const [profile, setProfile] = useState({ username: '', email: '', first_name: '', last_name: '' });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', new_password2: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logoutUser } = useAuth();

  /* ==========================================================================
     FETCH PROFILE
  ========================================================================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ==========================================================================
     HANDLERS
  ========================================================================== */
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (passwordData.new_password !== passwordData.new_password2) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(passwordData);
      setSuccess('Password changed successfully! You will be logged out shortly.');
      setTimeout(() => logoutUser(), 3000);
    } catch (err) {
      const apiError =
        err.response?.data?.old_password ||
        err.response?.data?.new_password ||
        'Failed to change password.';
      setError(apiError);
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
    <Container>
      {/* Page Header */}
      <div className="my-3">
        <div className="page-header d-flex justify-content-between align-items-center">
          <h1 className="mb-0"><i className="bi bi-person-gear" /> Manage Profile</h1>
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Profile & Password Forms */}
      <Row>
        {/* Profile Details */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Your Details</Card.Title>
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={profile.username} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={profile.email} onChange={handleProfileChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" name="first_name" value={profile.first_name} onChange={handleProfileChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" name="last_name" value={profile.last_name} onChange={handleProfileChange} />
                </Form.Group>
                <Button variant="primary" type="submit">Save Changes</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Change Password */}
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Change Password</Card.Title>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type="password" name="new_password2" value={passwordData.new_password2} onChange={handlePasswordChange} required />
                </Form.Group>
                <Button variant="warning" type="submit">Change Password</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;