import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import DashboardActions from '../components/DashboardActions';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Welcome to 99 Pancakes Analytics
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Kompally Outlet Dashboard
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {currentDate}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  👋 Hello, {user?.first_name}!
                </Typography>
                <Chip 
                  label={isAdmin ? '🔧 Administrator' : '👤 Sales User'} 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  {isAdmin ? 'Full system access' : 'Sales entry access'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" component="h3">
                Today's Focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Record accurate sales data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" component="h3">
                Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track monthly targets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StoreIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" component="h3">
                Outlet Status
              </Typography>
              <Chip label="Active" color="success" size="small" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dashboard Actions */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <DashboardActions />
      </Paper>

      {/* Role-specific Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          📚 Getting Started Guide
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              📊 Daily Operations
            </Typography>
            <Typography variant="body2" paragraph>
              1. Start with <strong>Daily Sales Entry</strong> to record today's sales
            </Typography>
            <Typography variant="body2" paragraph>
              2. Review <strong>Reports</strong> to track performance trends
            </Typography>
            <Typography variant="body2">
              3. Check previous entries for consistency and accuracy
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="secondary">
              {isAdmin ? '⚙️ Admin Features' : '🎯 User Features'}
            </Typography>
            {isAdmin ? (
              <>
                <Typography variant="body2" paragraph>
                  • Manage user accounts and permissions
                </Typography>
                <Typography variant="body2" paragraph>
                  • Review and approve edit requests
                </Typography>
                <Typography variant="body2">
                  • Access comprehensive analytics and reports
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" paragraph>
                  • Create daily sales entries for your outlet
                </Typography>
                <Typography variant="body2" paragraph>
                  • Request edits for existing entries
                </Typography>
                <Typography variant="body2">
                  • View performance reports and trends
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* System Status */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          🟢 System Status: Operational | Last Updated: {format(new Date(), 'HH:mm')}
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;