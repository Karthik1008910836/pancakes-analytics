import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  People,
  Store,
  TrendingUp,
  Edit,
  Delete,
  Add,
  Visibility,
  Check,
  Close,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, outletsApi, salesApi } from '../utils/api';
import { User, Outlet, MTDSummary } from '../types';
import { validatePasswordStrength } from '../utils/passwordValidation';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [mtdSummary, setMtdSummary] = useState<MTDSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'normal' as 'admin' | 'normal',
    outlet_id: '',
  });

  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const passwordValidation = useMemo(() => {
    return validatePasswordStrength(userForm.password);
  }, [userForm.password]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch users
      const usersResponse = await usersApi.getUsers();
      setUsers(usersResponse.data || []);

      const outletsResponse = await outletsApi.getOutlets();
      setOutlets(outletsResponse.data || []);

      // Fetch current month summary
      const currentDate = new Date();
      const mtdResponse = await salesApi.getMTDSummary({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      });
      setMtdSummary(mtdResponse.data?.summary || []);

    } catch (error: any) {
      setError(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormChange = (field: keyof typeof userForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Show password requirements when user starts typing password
    if (field === 'password') {
      if (value.length > 0) {
        setShowPasswordRequirements(true);
      } else {
        setShowPasswordRequirements(false);
      }
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserForm({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'normal',
      outlet_id: '',
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      outlet_id: user.outlet_id?.toString() || '',
    });
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      setUserActionLoading(true);
      setError('');
      setSuccess('');

      // Validate password for new users or when password is being changed
      if (userForm.password && !passwordValidation.isValid) {
        setError('❌ Error: Password does not meet security requirements. Please check the requirements below.');
        setTimeout(() => setError(''), 8000);
        setUserActionLoading(false);
        return;
      }

      const userData = {
        username: userForm.username,
        email: userForm.email,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        role: userForm.role,
        outlet_id: userForm.outlet_id ? parseInt(userForm.outlet_id) : undefined,
        ...(userForm.password && { password: userForm.password })
      };

      if (selectedUser) {
        // Update user
        await usersApi.updateUser(selectedUser.id, userData);
        setSuccess('✅ User updated successfully! Changes have been saved.');
      } else {
        // Create user
        await usersApi.createUser({ ...userData, password: userForm.password });
        setSuccess('✅ User created successfully! New user account is active.');
      }

      setOpenUserDialog(false);
      await fetchDashboardData();

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error: any) {
      let errorMessage = 'Failed to save user';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.msg).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`❌ Error: ${errorMessage}. Please check your input and try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setUserActionLoading(true);
      setError('');
      setSuccess('');

      await usersApi.toggleUserStatus(user.id);
      
      const action = user.is_active ? 'deactivated' : 'activated';
      setSuccess(`✅ User ${action} successfully! ${user.first_name} ${user.last_name} account is now ${user.is_active ? 'inactive' : 'active'}.`);
      
      await fetchDashboardData();

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to toggle user status';
      setError(`❌ Error: ${errorMessage}. Please try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setUserActionLoading(true);
      setError('');
      setSuccess('');

      await usersApi.deleteUser(user.id);
      setSuccess(`✅ User deleted successfully! ${user.first_name} ${user.last_name} account has been removed.`);
      
      await fetchDashboardData();

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete user';
      setError(`❌ Error: ${errorMessage}. User may have associated data - try deactivating instead.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setUserActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This page is only accessible to administrators.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        99 Pancakes Kompally - Owner Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Store />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Store Status
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Store Staff
                  </Typography>
                  <Typography variant="h5">
                    {users.filter(user => user.is_active).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    MTD Revenue
                  </Typography>
                  <Typography variant="h5">
                    ₹{mtdSummary.reduce((sum, item) => sum + item.total_net_sale, 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Achievement
                  </Typography>
                  <Typography variant="h5">
                    {mtdSummary.length > 0 
                      ? (mtdSummary.reduce((sum, item) => sum + parseFloat(item.achievement_percentage.toString()), 0) / mtdSummary.length).toFixed(1)
                      : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MTD Performance */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kompally Store - Monthly Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Outlet</TableCell>
                  <TableCell align="right">MTD Target</TableCell>
                  <TableCell align="right">MTD Sales</TableCell>
                  <TableCell align="right">Achievement</TableCell>
                  <TableCell align="right">Total Tickets</TableCell>
                  <TableCell align="right">Avg APC</TableCell>
                  <TableCell align="right">Days Reported</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mtdSummary.map((item) => (
                  <TableRow key={item.outlet.id}>
                    <TableCell>{item.outlet.name}</TableCell>
                    <TableCell align="right">₹{item.mtd_target.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{item.total_net_sale.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${item.achievement_percentage}%`}
                        color={parseFloat(item.achievement_percentage.toString()) >= 100 ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{item.total_tickets}</TableCell>
                    <TableCell align="right">₹{item.avg_apc}</TableCell>
                    <TableCell align="right">{item.days_reported}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateUser}
              disabled={userActionLoading}
            >
              Create User
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Outlet</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.outlet?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditUser(user)}
                          disabled={userActionLoading}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.is_active ? 'Deactivate User' : 'Activate User'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={userActionLoading}
                          color={user.is_active ? 'warning' : 'success'}
                        >
                          {user.is_active ? '🚫' : '✅'}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user)}
                          disabled={userActionLoading}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="textSecondary">
                        No users found. Create your first user account.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Outlet Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            99 Pancakes Kompally - Outlet Information
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outlets.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell>{outlet.name}</TableCell>
                    <TableCell>{outlet.city}</TableCell>
                    <TableCell>{outlet.manager_name}</TableCell>
                    <TableCell>{outlet.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={outlet.is_active ? 'Active' : 'Inactive'}
                        color={outlet.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={userForm.username}
                onChange={handleUserFormChange('username')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={handleUserFormChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.first_name}
                onChange={handleUserFormChange('first_name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.last_name}
                onChange={handleUserFormChange('last_name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'normal' }))}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Outlet</InputLabel>
                <Select
                  value={userForm.outlet_id}
                  onChange={(e) => setUserForm(prev => ({ ...prev, outlet_id: e.target.value }))}
                  disabled={userForm.role === 'admin'}
                >
                  <MenuItem value="">None</MenuItem>
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.id.toString()}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userForm.password}
                onChange={handleUserFormChange('password')}
                required={!selectedUser}
                error={userForm.password.length > 0 && !passwordValidation.isValid}
                helperText={
                  selectedUser
                    ? "Leave blank to keep current password"
                    : userForm.password.length > 0 
                      ? `Password strength: ${passwordValidation.strengthText}`
                      : "Must be 6+ characters with UPPERCASE, lowercase, and number"
                }
              />

              {/* Password Strength Indicator */}
              {userForm.password.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ minWidth: 120 }}>
                      Password Strength:
                    </Typography>
                    <Chip 
                      label={passwordValidation.strengthText}
                      size="small"
                      color={passwordValidation.strengthColor}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(passwordValidation.score / 4) * 100}
                    color={passwordValidation.strengthColor}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              {/* Password Requirements */}
              {showPasswordRequirements && (
                <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Info color="primary" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="primary">
                        Password Requirements
                      </Typography>
                    </Box>
                    
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {passwordValidation.requirements.length ? 
                            <Check color="success" sx={{ fontSize: 18 }} /> : 
                            <Close color="error" sx={{ fontSize: 18 }} />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least 6 characters" 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: passwordValidation.requirements.length ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {passwordValidation.requirements.uppercase ? 
                            <Check color="success" sx={{ fontSize: 18 }} /> : 
                            <Close color="error" sx={{ fontSize: 18 }} />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one UPPERCASE letter (A-Z)" 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: passwordValidation.requirements.uppercase ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {passwordValidation.requirements.lowercase ? 
                            <Check color="success" sx={{ fontSize: 18 }} /> : 
                            <Close color="error" sx={{ fontSize: 18 }} />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one lowercase letter (a-z)" 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: passwordValidation.requirements.lowercase ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {passwordValidation.requirements.number ? 
                            <Check color="success" sx={{ fontSize: 18 }} /> : 
                            <Close color="error" sx={{ fontSize: 18 }} />
                          }
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one number (0-9)" 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: passwordValidation.requirements.number ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                    </List>
                    
                    {passwordValidation.suggestions.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="info.dark" gutterBottom>
                          💡 Suggestions for a stronger password:
                        </Typography>
                        {passwordValidation.suggestions.map((suggestion, index) => (
                          <Typography key={index} variant="body2" color="info.dark">
                            {suggestion}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)} disabled={userActionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={userActionLoading}
          >
            {userActionLoading ? 'Saving...' : (selectedUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;