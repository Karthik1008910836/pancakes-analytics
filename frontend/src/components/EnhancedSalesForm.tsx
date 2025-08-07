import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { salesApi, editRequestApi } from '../utils/api';
import { SalesFormData } from '../types';

interface EnhancedSalesFormProps {
  onSuccess?: () => void;
}

const EnhancedSalesForm: React.FC<EnhancedSalesFormProps> = ({ onSuccess }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [showEditRequestDialog, setShowEditRequestDialog] = useState(false);
  const [editRequestReason, setEditRequestReason] = useState('');

  const [formData, setFormData] = useState<SalesFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    outlet_id: 1, // Kompally outlet
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

  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const [originalData, setOriginalData] = useState<SalesFormData | null>(null);

  const checkExistingEntry = async (date: string, showExistingData: boolean = false) => {
    try {
      const response = await salesApi.checkExistingEntry({
        date,
        outlet_id: 1
      });

      if (response.success && response.data) {
        if (response.data.exists && response.data.entry) {
          // Entry exists
          setExistingEntry(response.data);
          
          // For current date, keep form empty unless user explicitly wants to see existing data
          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          
          if (showExistingData || !isToday) {
            // Show existing data
            setIsEditingExisting(true);
            setFormMode(isAdmin ? 'edit' : 'view');
          
          const entryData = {
            date,
            outlet_id: response.data.entry.outlet_id,
            mtd_target: response.data.entry.mtd_target,
            daily_target: response.data.entry.daily_target,
            gross_sale: response.data.entry.gross_sale,
            net_sale: response.data.entry.net_sale,
            total_tickets: response.data.entry.total_tickets,
            offline_net_sale: response.data.entry.offline_net_sale,
            offline_tickets: response.data.entry.offline_tickets,
            cakes_sold: response.data.entry.cakes_sold,
            pastries_sold: response.data.entry.pastries_sold,
          };
          
            setFormData(entryData);
            setOriginalData(entryData);
          } else {
            // Keep form empty for current date entry
            setIsEditingExisting(false);
            setFormMode('create');
            setOriginalData(null);
            setFormData({
              date,
              outlet_id: 1,
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
          }
        } else {
          // No entry exists - show empty form
          setExistingEntry(null);
          setOriginalData(null);
          setIsEditingExisting(false);
          setFormMode('create');
          
          // Reset form to empty values for new entry
          setFormData({
            date,
            outlet_id: 1,
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
        }
      }
    } catch (error: any) {
      console.error('Error checking existing entry:', error);
    }
  };

  useEffect(() => {
    checkExistingEntry(formData.date);
  }, []);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, date: dateString }));
      checkExistingEntry(dateString);
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
    if (field !== 'date' && field !== 'outlet_id' && formData[field] === 0) {
      setFormData(prev => ({
        ...prev,
        [field]: '' as any
      }));
      event.target.select();
    }
  };

  const handleInputBlur = (field: keyof SalesFormData) => (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    if (field !== 'date' && field !== 'outlet_id' && event.target.value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: 0
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.date) {
      setError('❌ Date is required');
      return false;
    }

    if (formData.net_sale < 0 || formData.gross_sale < 0 || formData.total_tickets < 0) {
      setError('❌ Sales values cannot be negative');
      return false;
    }

    if (formData.net_sale > formData.gross_sale) {
      setError('❌ Net sale cannot be greater than gross sale');
      return false;
    }

    if (formData.offline_tickets > formData.total_tickets) {
      setError('❌ Offline tickets cannot be greater than total tickets');
      return false;
    }

    if (formData.offline_net_sale > formData.net_sale) {
      setError('❌ Offline net sale cannot be greater than total net sale');
      return false;
    }

    return true;
  };

  const getChangedFields = () => {
    if (!originalData) return {};
    
    const changes: any = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof SalesFormData;
      if (field !== 'date' && field !== 'outlet_id' && 
          formData[field] !== originalData[field]) {
        changes[field] = formData[field];
      }
    });
    
    return changes;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    // If existing entry and user is not admin, check if we need edit request
    if (existingEntry && !isAdmin) {
      const changes = getChangedFields();
      if (Object.keys(changes).length > 0) {
        if (!existingEntry.canRequestEdit) {
          setError('❌ You cannot edit this entry. There may be a pending edit request.');
          return;
        }
        
        // Show edit request dialog
        setShowEditRequestDialog(true);
        return;
      } else {
        setError('❌ No changes detected to save.');
        return;
      }
    }

    setLoading(true);

    try {
      if (existingEntry && existingEntry.exists) {
        // Admin direct edit
        await salesApi.updateEntry(existingEntry.entry.id, formData);
        setSuccess('✅ Sales entry updated successfully! Data has been saved to the database.');
      } else {
        // New entry
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

      setTimeout(() => setSuccess(''), 5000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save sales entry';
      setError(`❌ Error: ${errorMessage}. Please check your data and try again.`);
      setTimeout(() => setError(''), 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = async () => {
    if (!editRequestReason.trim() || editRequestReason.length < 10) {
      setError('❌ Please provide a detailed reason (minimum 10 characters) for the edit request.');
      return;
    }

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      setError('❌ No changes detected to request.');
      return;
    }

    setLoading(true);

    try {
      await editRequestApi.createEditRequest({
        daily_sales_id: existingEntry.entry.id,
        reason: editRequestReason,
        proposed_changes: changes
      });

      setSuccess('✅ Edit request submitted successfully! An admin will review your request.');
      setShowEditRequestDialog(false);
      setEditRequestReason('');
      
      // Refresh the existing entry status
      checkExistingEntry(formData.date);

      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit edit request';
      setError(`❌ Error: ${errorMessage}. Please try again.`);
      setTimeout(() => setError(''), 8000);
    } finally {
      setLoading(false);
    }
  };

  const apc = formData.total_tickets > 0 ? (formData.net_sale / formData.total_tickets).toFixed(2) : '0.00';
  const targetAchievement = formData.daily_target > 0 ? ((formData.net_sale / formData.daily_target) * 100).toFixed(2) : '0.00';

  const canEdit = existingEntry ? (isAdmin || existingEntry.canRequestEdit) : true;
  const isReadOnly = existingEntry && !isAdmin && !existingEntry.canRequestEdit;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          {/* Header with Form Mode Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Daily Sales Entry
            </Typography>
            <Chip
              label={
                formMode === 'create' 
                  ? '📝 New Entry' 
                  : formMode === 'edit' 
                    ? '✏️ Editing Existing' 
                    : '👁️ View Only'
              }
              color={
                formMode === 'create' 
                  ? 'success' 
                  : formMode === 'edit' 
                    ? 'warning' 
                    : 'default'
              }
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Current Date Indicator */}
          {formData.date === format(new Date(), 'yyyy-MM-dd') && (
            <Alert 
              severity="info" 
              sx={{ mb: 2, backgroundColor: 'primary.50' }}
              icon={<span>📅</span>}
            >
              <strong>Today's Entry</strong> - You're working with today's sales data ({format(new Date(), 'MMM dd, yyyy')})
            </Alert>
          )}

          {/* Existing Entry Status */}
          {existingEntry && existingEntry.exists ? (
            formMode === 'create' && formData.date === format(new Date(), 'yyyy-MM-dd') ? (
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<span>📋</span>}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => checkExistingEntry(formData.date, true)}
                  >
                    View Existing Entry
                  </Button>
                }
              >
                <strong>Entry Already Exists for Today</strong><br />
                Sales data for today has been entered. Click "View Existing Entry" to see it, or continue entering new data.
              </Alert>
            ) : (
              <Alert 
                severity={existingEntry.hasPendingEditRequest ? "warning" : "info"} 
                sx={{ mb: 2 }}
                icon={<span>📋</span>}
              >
                {existingEntry.hasPendingEditRequest ? (
                  <>
                    <strong>Entry Found with Pending Edit Request</strong><br />
                    Sales data for this date exists with a pending modification request.
                    {isAdmin ? " You can approve/reject it in the Admin Dashboard." : " Please wait for admin approval."}
                  </>
                ) : (
                  <>
                    <strong>Entry Found - Pre-filled with Existing Data</strong><br />
                    Sales data for this date already exists and has been loaded into the form.
                    {isAdmin ? " You can modify it directly." : " You can request edits from an admin."}
                  </>
                )}
              </Alert>
            )
          ) : (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              icon={<span>✨</span>}
            >
              <strong>New Entry Mode</strong><br />
              No sales data found for this date. Fill out the form to create a new entry.
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={new Date(formData.date)}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  disabled={isReadOnly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: 'medium'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Outlet"
                  value="99 Pancakes Kompally"
                  InputProps={{ readOnly: true }}
                  size="medium"
                  required
                  helperText="Your outlet location (automatically selected)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="MTD Target (₹)"
                  type="number"
                  value={formData.mtd_target || ''}
                  onChange={handleInputChange('mtd_target')}
                  onFocus={handleInputFocus('mtd_target')}
                  onBlur={handleInputBlur('mtd_target')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Month-to-date sales target"
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Daily Target (₹)"
                  type="number"
                  value={formData.daily_target || ''}
                  onChange={handleInputChange('daily_target')}
                  onFocus={handleInputFocus('daily_target')}
                  onBlur={handleInputBlur('daily_target')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Today's sales target"
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gross Sale (₹)"
                  type="number"
                  value={formData.gross_sale || ''}
                  onChange={handleInputChange('gross_sale')}
                  onFocus={handleInputFocus('gross_sale')}
                  onBlur={handleInputBlur('gross_sale')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Total sales before deductions"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Net Sale (₹)"
                  type="number"
                  value={formData.net_sale || ''}
                  onChange={handleInputChange('net_sale')}
                  onFocus={handleInputFocus('net_sale')}
                  onBlur={handleInputBlur('net_sale')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Final sales after deductions"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Tickets"
                  type="number"
                  value={formData.total_tickets || ''}
                  onChange={handleInputChange('total_tickets')}
                  onFocus={handleInputFocus('total_tickets')}
                  onBlur={handleInputBlur('total_tickets')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Number of orders (online + offline)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Offline Net Sale (₹)"
                  type="number"
                  value={formData.offline_net_sale || ''}
                  onChange={handleInputChange('offline_net_sale')}
                  onFocus={handleInputFocus('offline_net_sale')}
                  onBlur={handleInputBlur('offline_net_sale')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Cash/card sales at store"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Offline Tickets"
                  type="number"
                  value={formData.offline_tickets || ''}
                  onChange={handleInputChange('offline_tickets')}
                  onFocus={handleInputFocus('offline_tickets')}
                  onBlur={handleInputBlur('offline_tickets')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Number of offline orders"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cakes Sold"
                  type="number"
                  value={formData.cakes_sold || ''}
                  onChange={handleInputChange('cakes_sold')}
                  onFocus={handleInputFocus('cakes_sold')}
                  onBlur={handleInputBlur('cakes_sold')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Number of cakes sold"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pastries Sold"
                  type="number"
                  value={formData.pastries_sold || ''}
                  onChange={handleInputChange('pastries_sold')}
                  onFocus={handleInputFocus('pastries_sold')}
                  onBlur={handleInputBlur('pastries_sold')}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  inputProps={{ min: 0, inputMode: 'numeric' }}
                  helperText="Number of pastries sold"
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Calculated Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Average Per Cover
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{apc}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Target Achievement
                      </Typography>
                      <Typography variant="h6" color={parseFloat(targetAchievement) >= 100 ? 'success.main' : 'warning.main'}>
                        {targetAchievement}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Online Tickets
                      </Typography>
                      <Typography variant="h6">
                        {formData.total_tickets - formData.offline_tickets}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Online Sale
                      </Typography>
                      <Typography variant="h6">
                        ₹{(formData.net_sale - formData.offline_net_sale).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 }, 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'stretch', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  {/* Form Actions Left Side */}
                  <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                    {formMode === 'edit' && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => checkExistingEntry(formData.date, true)}
                        disabled={loading}
                      >
                        🔄 Reset to Original
                      </Button>
                    )}
                    {formMode === 'create' && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setFormData({
                            ...formData,
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
                        }}
                        disabled={loading}
                      >
                        🗑️ Clear Form
                      </Button>
                    )}
                  </Box>

                  {/* Submit Button Right Side */}
                  <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {!isReadOnly && (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                        size="large"
                        fullWidth
                        color={
                          formMode === 'create' 
                            ? 'success' 
                            : formMode === 'edit' 
                              ? 'warning' 
                              : 'primary'
                        }
                        sx={{ 
                          minHeight: { xs: 48, sm: 'auto' },
                          fontSize: { xs: '1rem', sm: '0.875rem' }
                        }}
                      >
                        {loading ? 'Saving...' : 
                         formMode === 'create' 
                           ? '✅ Create New Entry' 
                           : formMode === 'edit'
                             ? '📝 Update Entry'
                             : '📤 Request Edit'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Request Dialog */}
      <Dialog open={showEditRequestDialog} onClose={() => setShowEditRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Edit Permission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You are requesting permission to edit an existing sales entry. Please provide a detailed reason for this request.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Edit Request"
            value={editRequestReason}
            onChange={(e) => setEditRequestReason(e.target.value)}
            margin="normal"
            placeholder="e.g., Need to correct the cake count due to a counting error..."
            helperText={`Minimum 10 characters required (${editRequestReason.length}/10)`}
            error={editRequestReason.length > 0 && editRequestReason.length < 10}
          />

          {Object.keys(getChangedFields()).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Proposed Changes:
              </Typography>
              {Object.entries(getChangedFields()).map(([field, value]) => (
                <Chip
                  key={field}
                  label={`${field.replace(/_/g, ' ')}: ${originalData?.[field as keyof SalesFormData]} → ${value}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditRequestDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditRequest} 
            variant="contained"
            disabled={loading || editRequestReason.length < 10}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EnhancedSalesForm;