import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EnhancedSalesForm from '../components/EnhancedSalesForm';

const DailySalesEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSuccess = () => {
    setSuccessMessage('Sales entry created successfully! You can add another entry or view reports.');
    // Auto-clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateReports = () => {
    navigate('/reports');
  };

  const handleNavigateAdmin = () => {
    navigate('/admin');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="#"
            onClick={handleNavigateHome}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AddIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Daily Sales Entry
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Daily Sales Entry
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Record daily sales data for Kompally outlet
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip 
              label={isAdmin ? 'Admin User' : 'Sales User'} 
              color={isAdmin ? 'secondary' : 'success'}
              sx={{ mb: 1, color: 'white', fontWeight: 'bold' }}
            />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Welcome, {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Outlet: Kompally
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* User Role Instructions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom color="primary">
          📋 Instructions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {isAdmin ? (
          <Box>
            <Typography variant="body1" paragraph>
              <strong>Admin Access:</strong> You can create, edit, and delete sales entries for any date.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Create new sales entries
              • Edit existing entries directly
              • Delete entries if needed
              • Access all reports and analytics
              • Manage user accounts and outlets
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" paragraph>
              <strong>Normal User Access:</strong> You can create new sales entries and request edits for existing ones.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Create sales entries for current and past dates
              • Request edits for existing entries (requires admin approval)
              • View your submitted entries
              • Access basic reports for your outlet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Sales Entry Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            🏪 Kompally Outlet - Sales Entry Form
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in all required fields to record today's sales data. All amounts should be in Indian Rupees (₹).
          </Typography>
        </Box>
        
        <EnhancedSalesForm onSuccess={handleSuccess} />
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label="📊 View Reports"
            color="primary"
            clickable
            onClick={handleNavigateReports}
            sx={{ fontSize: '0.9rem', py: 2, px: 1 }}
          />
          <Chip
            label="🏠 Dashboard"
            color="secondary"
            clickable
            onClick={handleNavigateHome}
            sx={{ fontSize: '0.9rem', py: 2, px: 1 }}
          />
          {isAdmin && (
            <Chip
              label="⚙️ Admin Panel"
              color="warning"
              clickable
              onClick={handleNavigateAdmin}
              sx={{ fontSize: '0.9rem', py: 2, px: 1 }}
            />
          )}
        </Box>
      </Paper>

      {/* Footer Info */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: You can navigate back anytime using the breadcrumb navigation above
        </Typography>
      </Box>
    </Container>
  );
};

export default DailySalesEntry;