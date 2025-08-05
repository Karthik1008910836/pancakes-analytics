import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const handleInputChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  99 Pancakes
                </Typography>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  Kompally Outlet
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Sales Analytics Dashboard
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  margin="normal"
                  required
                  autoComplete="username"
                  autoFocus
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  margin="normal"
                  required
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Login Credentials:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Admin: admin / admin123
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Staff: kompallyuser / password
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;