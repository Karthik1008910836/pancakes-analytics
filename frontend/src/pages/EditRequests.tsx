import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Alert,
  Grid,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Edit,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { editRequestApi } from '../utils/api';
import { format } from 'date-fns';

const EditRequests: React.FC = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEditRequests();
  }, [statusFilter]);

  const fetchEditRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await editRequestApi.getEditRequests(params);
      if (response.success && response.data) {
        setRequests(response.data.requests || []);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch edit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
  };

  const handleReviewRequest = (request: any, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setOpenReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await editRequestApi.reviewEditRequest(selectedRequest.id, {
        status: reviewAction,
        review_notes: reviewNotes || undefined
      });

      setSuccess(`✅ Edit request ${reviewAction} successfully!`);
      setOpenReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes('');
      
      // Refresh the list
      await fetchEditRequests();

      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(`❌ Error: ${error.message || 'Failed to review request'}`);
      setTimeout(() => setError(''), 8000);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" icon={<AccessTime />} />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" icon={<CheckCircle />} />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<Cancel />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatChanges = (proposedChanges: any) => {
    return Object.entries(proposedChanges).map(([field, value]) => (
      <Chip
        key={field}
        label={`${field.replace(/_/g, ' ')}: ${value}`}
        size="small"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
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
        <Typography>Loading edit requests...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Requests Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Filter Edit Requests
            </Typography>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Outlet</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.dailySales.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{request.dailySales.outlet.name}</TableCell>
                    <TableCell>
                      {request.requestedBy.first_name} {request.requestedBy.last_name}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {request.requestedBy.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {request.reason.length > 50 
                          ? `${request.reason.substring(0, 50)}...` 
                          : request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {request.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleReviewRequest(request, 'approved')}
                              disabled={actionLoading}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReviewRequest(request, 'rejected')}
                              disabled={actionLoading}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="textSecondary">
                        {statusFilter === 'all' 
                          ? 'No edit requests found.' 
                          : `No ${statusFilter} edit requests found.`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Request Details Dialog */}
      <Dialog 
        open={!!selectedRequest && !openReviewDialog} 
        onClose={() => setSelectedRequest(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Edit Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sales Entry Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedRequest.dailySales.date), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Outlet
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.dailySales.outlet.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Requested By
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.requestedBy.first_name} {selectedRequest.requestedBy.last_name}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {selectedRequest.requestedBy.email}
                  </Typography>
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(selectedRequest.status)}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reason for Edit
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.reason}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Proposed Changes
                </Typography>
                <Box>
                  {formatChanges(selectedRequest.proposed_changes)}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Request Created
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expires At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedRequest.expires_at), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Grid>
              
              {selectedRequest.reviewed_at && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reviewed By
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.reviewedBy?.first_name} {selectedRequest.reviewedBy?.last_name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reviewed At
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {format(new Date(selectedRequest.reviewed_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  
                  {selectedRequest.review_notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Review Notes
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedRequest.review_notes}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleReviewRequest(selectedRequest, 'approved')}
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
              >
                Approve
              </Button>
              <Button
                onClick={() => handleReviewRequest(selectedRequest, 'rejected')}
                variant="contained"
                color="error"
                startIcon={<Cancel />}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approved' ? 'Approve' : 'Reject'} Edit Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You are about to {reviewAction === 'approved' ? 'approve' : 'reject'} this edit request.
            {reviewAction === 'approved' && ' The proposed changes will be applied to the sales entry.'}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Review Notes (Optional)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            margin="normal"
            placeholder="Add any notes about your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approved' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 
             (reviewAction === 'approved' ? 'Approve Request' : 'Reject Request')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditRequests;