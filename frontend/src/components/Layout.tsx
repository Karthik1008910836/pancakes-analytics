import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard,
  Assessment,
  EditNote,
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/')}
          >
            🥞 Kompally - 99 Pancakes
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Daily Sales Entry Button - Prominent for both admin and normal users */}
            <Button
              color="secondary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/daily-sales-entry')}
              sx={{ 
                mr: 2,
                fontWeight: 'bold',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Daily Sales Entry
            </Button>

            <Typography variant="body1">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              ({user?.role})
            </Typography>
            
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              startIcon={<Avatar sx={{ width: 32, height: 32 }}>{user?.first_name?.charAt(0)}</Avatar>}
            >
              Profile
            </Button>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { navigate('/daily-sales-entry'); handleMenuClose(); }}>
              <ListItemIcon>
                <ReceiptIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Daily Sales Entry</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile Settings</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => { navigate('/'); handleMenuClose(); }}>
              <ListItemIcon>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dashboard</ListItemText>
            </MenuItem>

            {isAdmin && (
              <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                <ListItemIcon>
                  <Dashboard fontSize="small" />
                </ListItemIcon>
                <ListItemText>Admin Panel</ListItemText>
              </MenuItem>
            )}

            {isAdmin && (
              <MenuItem onClick={() => { navigate('/edit-requests'); handleMenuClose(); }}>
                <ListItemIcon>
                  <EditNote fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Requests</ListItemText>
              </MenuItem>
            )}
            
            <MenuItem onClick={() => { navigate('/reports'); handleMenuClose(); }}>
              <ListItemIcon>
                <Assessment fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reports</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;