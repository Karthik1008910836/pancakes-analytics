import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials } from '../types';
import { authApi } from '../utils/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = () => {
    setUser(null);
    setToken(null);
    setSessionWarning(false);
    setSessionExpired(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setupSessionTimers = (expTime: number) => {
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = (expTime - currentTime) * 1000; // Convert to milliseconds
    
    // Show warning 2 minutes before expiry
    const warningTime = timeUntilExpiry - (2 * 60 * 1000);
    
    if (warningTime > 0) {
      setTimeout(() => {
        setSessionWarning(true);
      }, warningTime);
    }
    
    // Auto logout when token expires
    setTimeout(() => {
      setSessionExpired(true);
      logout();
    }, timeUntilExpiry);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          // Token is already expired
          logout();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Setup session timeout warnings
          setupSessionTimers(payload.exp);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Setup session timers for the new token
        try {
          const payload = JSON.parse(atob(userToken.split('.')[1]));
          if (payload.exp) {
            setupSessionTimers(payload.exp);
          }
        } catch (error) {
          console.error('Error parsing token for session timers:', error);
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Warning Dialog */}
      <Dialog 
        open={sessionWarning && !sessionExpired} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>⚠️ Session Expiring Soon</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your session will expire in 2 minutes due to inactivity.
          </Alert>
          <Typography>
            Please save any unsaved work. You will be automatically logged out when the session expires.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setSessionWarning(false);
              logout();
              window.location.href = '/';
            }} 
            variant="contained"
          >
            Continue Session (Login Again)
          </Button>
          <Button 
            onClick={() => {
              setSessionWarning(false);
              logout();
            }}
            color="error"
          >
            Logout Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Expired Dialog */}
      <Dialog 
        open={sessionExpired} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>🔒 Session Expired</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Your session has expired for security reasons.
          </Alert>
          <Typography>
            You have been automatically logged out after 10 minutes of inactivity. 
            Please login again to continue using the application.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setSessionExpired(false);
              window.location.href = '/';
            }} 
            variant="contained"
          >
            Login Again
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};