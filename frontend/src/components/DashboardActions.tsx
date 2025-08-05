import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as ReportsIcon,
  Dashboard as AdminIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardActions: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const theme = useTheme();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const actions = [
    {
      title: 'Daily Sales Entry',
      description: 'Record today\'s sales data for Kompally outlet',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      path: '/daily-sales-entry',
      highlight: true,
      forAdmin: false,
      forNormal: true
    },
    {
      title: 'View Reports',
      description: 'Analytics, trends, and performance reports',
      icon: <ReportsIcon sx={{ fontSize: 40 }} />,
      color: 'secondary',
      path: '/reports',
      highlight: false,
      forAdmin: true,
      forNormal: true
    }
  ];

  const adminActions = [
    {
      title: 'Admin Dashboard',
      description: 'User management and outlet administration',
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      path: '/admin',
      highlight: false,
      forAdmin: true,
      forNormal: false
    },
    {
      title: 'Edit Requests',
      description: 'Review and approve sales data edit requests',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      path: '/edit-requests',
      highlight: false,
      forAdmin: true,
      forNormal: false
    }
  ];

  const availableActions = actions.filter(action => 
    (isAdmin && action.forAdmin) || (!isAdmin && action.forNormal) || (action.forAdmin && action.forNormal)
  );

  const availableAdminActions = isAdmin ? adminActions : [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        🚀 Quick Actions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose an action to get started with your daily tasks
      </Typography>

      {/* Main Actions */}\n      <Grid container spacing={3}>
        {availableActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={action.highlight ? 6 : 2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                backgroundColor: action.highlight 
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'background.paper',
                border: action.highlight 
                  ? `2px solid ${theme.palette.primary.main}`
                  : '1px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.primary.main
                }
              }}
              onClick={() => handleNavigate(action.path)}
            >
              {action.highlight && (
                <Chip
                  label="Recommended"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: `${action.color}.main`,
                    color: 'white'
                  }}
                >
                  {action.icon}
                </Avatar>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant={action.highlight ? 'contained' : 'outlined'}
                  color={action.color as any}
                  size="large"
                  startIcon={action.icon}
                  sx={{ minWidth: 140 }}
                >
                  {action.highlight ? 'Start Now' : 'Open'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Admin Actions */}
        {availableAdminActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={`admin-${index}`}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.warning.main
                }
              }}
              onClick={() => handleNavigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: `${action.color}.main`,
                    color: 'white'
                  }}
                >
                  {action.icon}
                </Avatar>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="outlined"
                  color={action.color as any}
                  size="large"
                  startIcon={action.icon}
                  sx={{ minWidth: 140 }}
                >
                  Manage
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Role-specific Tips */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          💡 {isAdmin ? 'Admin' : 'User'} Tips
        </Typography>
        {isAdmin ? (
          <Typography variant="body2" color="text.secondary">
            As an admin, you have full access to all features. You can create, edit, and delete sales entries, 
            manage users, and access comprehensive reports. Use the Admin Dashboard to manage system settings 
            and review edit requests from normal users.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            As a normal user, focus on accurate daily sales entry. If you need to modify an existing entry, 
            use the edit request feature which will be reviewed by an admin. You can access reports to track 
            your outlet's performance.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardActions;