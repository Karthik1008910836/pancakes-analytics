import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { salesApi, outletsApi } from '../utils/api';
import { SalesFormData, Outlet } from '../types';

interface SalesFormProps {
  onSuccess?: () => void;
  editData?: any;
}

const SalesForm: React.FC<SalesFormProps> = ({ onSuccess, editData }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState<SalesFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    outlet_id: user?.outlet_id || 1, // Default to Kompally outlet (ID: 1)
    mtd_target: 0,
    daily_target: 0,
    gross_sale: 0,
    net_sale: 0,
    total_tickets: 0,
    offline_net_sale: 0,
    offline_tickets: 0,
    cakes_sold: 0,
    pastries_sold: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchOutlets();
    }
    if (editData) {
      setFormData({
        ...editData,
        date: format(new Date(editData.date), 'yyyy-MM-dd'),
      });
    }
  }, [isAdmin, editData]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getOutlets();
      if (response.success && response.data) {
        setOutlets(response.data);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const handleInputChange = (field: keyof SalesFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'date' || field === 'outlet_id' ? value : value === '' ? 0 : parseFloat(value) || 0
    }));
  };

  const handleInputFocus = (field: keyof SalesFormData) => (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    // Clear the field if it's 0 when focused
    if (field !== 'date' && field !== 'outlet_id' && formData[field] === 0) {
      setFormData(prev => ({
        ...prev,
        [field]: '' as any
      }));
      event.target.select(); // Select all text for easy replacement
    }
  };

  const handleInputBlur = (field: keyof SalesFormData) => (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    // If field is empty when losing focus, set to 0
    if (field !== 'date' && field !== 'outlet_id' && event.target.value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: 0 as any
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.date || !formData.outlet_id) {
      setError('❌ Date and Outlet are required fields. Please ensure both are selected.');
      return false;
    }

    if (formData.gross_sale <= 0) {
      setError('❌ Gross sale must be greater than zero.');
      return false;
    }

    if (formData.net_sale > formData.gross_sale) {
      setError('❌ Gross sale must be higher than net sale. Please check your sales figures.');
      return false;
    }

    if (formData.offline_tickets > formData.total_tickets) {
      setError('❌ Offline tickets cannot exceed total tickets. Please check your ticket counts.');
      return false;
    }

    if (formData.offline_net_sale > formData.net_sale) {
      setError('❌ Offline net sale cannot exceed total net sale. Please verify your sales breakdown.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editData) {
        await salesApi.updateEntry(editData.id, formData);
        setSuccess('✅ Sales entry updated successfully! Data has been saved to the database.');
      } else {
        await salesApi.createEntry(formData);
        setSuccess('✅ Sales entry created successfully! Your daily sales data has been recorded.');
        // Reset form for new entry
        setFormData({
          ...formData,
          gross_sale: 0,
          net_sale: 0,
          total_tickets: 0,
          offline_net_sale: 0,
          offline_tickets: 0,
          cakes_sold: 0,
          pastries_sold: 0,
        });
      }

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save sales entry';
      setError(`❌ Error: ${errorMessage}. Please check your data and try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const apc = formData.total_tickets > 0 ? (formData.net_sale / formData.total_tickets).toFixed(2) : '0.00';
  const targetAchievement = formData.daily_target > 0 ? ((formData.net_sale / formData.daily_target) * 100).toFixed(2) : '0.00';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {editData ? 'Edit Sales Entry' : 'Daily Sales Entry'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={new Date(formData.date)}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Outlet"
                  value="99 Pancakes Kompally"
                  InputProps={{ readOnly: true }}
                  required
                  helperText="Your outlet location (automatically selected)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MTD Target (₹)"
                  type="number"
                  value={formData.mtd_target || ''}
                  onChange={handleInputChange('mtd_target')}
                  onFocus={handleInputFocus('mtd_target')}
                  onBlur={handleInputBlur('mtd_target')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Daily Target (₹)"
                  type="number"
                  value={formData.daily_target || ''}
                  onChange={handleInputChange('daily_target')}
                  onFocus={handleInputFocus('daily_target')}
                  onBlur={handleInputBlur('daily_target')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gross Sale (₹)"
                  type="number"
                  value={formData.gross_sale || ''}
                  onChange={handleInputChange('gross_sale')}
                  onFocus={handleInputFocus('gross_sale')}
                  onBlur={handleInputBlur('gross_sale')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Total sales before deductions"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Net Sale (₹)"
                  type="number"
                  value={formData.net_sale || ''}
                  onChange={handleInputChange('net_sale')}
                  onFocus={handleInputFocus('net_sale')}
                  onBlur={handleInputBlur('net_sale')}
                  required
                  error={formData.net_sale > 0 && formData.gross_sale > 0 && formData.net_sale > formData.gross_sale}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText={formData.net_sale > 0 && formData.gross_sale > 0 && formData.net_sale > formData.gross_sale ? 
                    "⚠️ Net sale cannot be higher than gross sale" : 
                    "Sales after deductions (must be ≤ gross sale)"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Tickets"
                  type="number"
                  value={formData.total_tickets || ''}
                  onChange={handleInputChange('total_tickets')}
                  onFocus={handleInputFocus('total_tickets')}
                  onBlur={handleInputBlur('total_tickets')}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Offline Net Sale (₹)"
                  type="number"
                  value={formData.offline_net_sale || ''}
                  onChange={handleInputChange('offline_net_sale')}
                  onFocus={handleInputFocus('offline_net_sale')}
                  onBlur={handleInputBlur('offline_net_sale')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Offline Tickets"
                  type="number"
                  value={formData.offline_tickets || ''}
                  onChange={handleInputChange('offline_tickets')}
                  onFocus={handleInputFocus('offline_tickets')}
                  onBlur={handleInputBlur('offline_tickets')}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cakes Sold"
                  type="number"
                  value={formData.cakes_sold || ''}
                  onChange={handleInputChange('cakes_sold')}
                  onFocus={handleInputFocus('cakes_sold')}
                  onBlur={handleInputBlur('cakes_sold')}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pastries Sold"
                  type="number"
                  value={formData.pastries_sold || ''}
                  onChange={handleInputChange('pastries_sold')}
                  onFocus={handleInputFocus('pastries_sold')}
                  onBlur={handleInputBlur('pastries_sold')}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Average Per Cover (APC)"
                  value={`₹${apc}`}
                  InputProps={{ readOnly: true }}
                  helperText="Calculated automatically (Net Sale ÷ Total Tickets)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Achievement"
                  value={`${targetAchievement}%`}
                  InputProps={{ readOnly: true }}
                  helperText="Calculated automatically (Net Sale ÷ Daily Target × 100)"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Saving...' : editData ? 'Update Entry' : 'Save Entry'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default SalesForm;