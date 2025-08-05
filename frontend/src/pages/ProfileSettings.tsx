import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Person, Lock, Check, Close, Info } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../utils/api';
import { validatePasswordStrength, getPasswordRequirementsText } from '../utils/passwordValidation';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const passwordValidation = useMemo(() => {
    return validatePasswordStrength(passwordData.new_password);
  }, [passwordData.new_password]);

  const handleProfileChange = (field: keyof typeof profileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (field: keyof typeof passwordData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
    
    // Show requirements when user starts typing new password
    if (field === 'new_password' && value.length > 0) {
      setShowPasswordRequirements(true);
    } else if (field === 'new_password' && value.length === 0) {
      setShowPasswordRequirements(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.updateProfile(profileData);
      setSuccess('✅ Profile updated successfully! Your information has been saved.');
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(`❌ Error: ${errorMessage}. Please check your information and try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('❌ Error: New passwords do not match. Please try again.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!passwordValidation.isValid) {
      setError('❌ Error: Password does not meet security requirements. Please check the requirements below.');
      setTimeout(() => setError(''), 8000);
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setSuccess('✅ Password changed successfully! Your new password is now active.');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change password';
      setError(`❌ Error: ${errorMessage}. Please verify your current password and try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Typography variant="h6">Profile Information</Typography>
              </Box>

              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.first_name}
                  onChange={handleProfileChange('first_name')}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.last_name}
                  onChange={handleProfileChange('last_name')}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange('email')}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Role"
                  value={user?.role?.toUpperCase()}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                  helperText="Role cannot be changed"
                />

                {user?.outlet && (
                  <TextField
                    fullWidth
                    label="Assigned Outlet"
                    value={user.outlet.name}
                    margin="normal"
                    InputProps={{ readOnly: true }}
                    helperText="Outlet assignment cannot be changed"
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  <Lock />
                </Avatar>
                <Typography variant="h6">Change Password</Typography>
              </Box>

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange('current_password')}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange('new_password')}
                  margin="normal"
                  required
                  error={passwordData.new_password.length > 0 && !passwordValidation.isValid}
                  helperText={
                    passwordData.new_password.length > 0 
                      ? `Password strength: ${passwordValidation.strengthText}`
                      : "Must be 6+ characters with UPPERCASE, lowercase, and number"
                  }
                />

                {/* Password Strength Indicator */}
                {passwordData.new_password.length > 0 && (
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

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange('confirm_password')}
                  margin="normal"
                  required
                  error={
                    passwordData.confirm_password.length > 0 && 
                    passwordData.new_password !== passwordData.confirm_password
                  }
                  helperText={
                    passwordData.confirm_password.length > 0 && 
                    passwordData.new_password !== passwordData.confirm_password
                      ? "⚠️ Passwords do not match"
                      : passwordData.confirm_password.length > 0 && 
                        passwordData.new_password === passwordData.confirm_password
                        ? "✅ Passwords match"
                        : "Re-enter your new password"
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">
                    {user?.username}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Typography variant="body1" color={user?.is_active ? 'success.main' : 'error.main'}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileSettings;