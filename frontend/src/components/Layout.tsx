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
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard,
  Assessment,
  EditNote,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}
            onClick={() => navigate('/')}
          >
            🥞 {isMobile ? 'Kompally' : 'Kompally - 99 Pancakes'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
            {!isMobile && (
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
            )}

            {!isMobile && (
              <>
                <Typography variant="body1">
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                  ({user?.role})
                </Typography>
              </>
            )}
            
            {isMobile ? (
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ p: 1 }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<Avatar sx={{ width: 32, height: 32 }}>{user?.first_name?.charAt(0)}</Avatar>}
              >
                Profile
              </Button>
            )}
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
            PaperProps={{
              sx: {
                minWidth: isMobile ? 200 : 250,
                maxWidth: isMobile ? 250 : 300,
              }
            }}
          >
            {isMobile && (
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                <ListItemIcon>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                    {user?.first_name?.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role}
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
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

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: isMobile ? 2 : 4, 
          mb: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;