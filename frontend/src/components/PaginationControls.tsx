import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack
} from '@mui/material';
import { PaginationState } from '../hooks/usePagination';

interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  loading = false
}) => {
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handleLimitChange = (event: any) => {
    onLimitChange(parseInt(event.target.value));
  };

  if (pagination.total === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} results
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={pagination.limit}
            label="Per Page"
            onChange={handleLimitChange}
            disabled={loading}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Pagination
        count={pagination.totalPages}
        page={pagination.page}
        onChange={handlePageChange}
        disabled={loading}
        color="primary"
        showFirstButton
        showLastButton
        siblingCount={1}
        boundaryCount={1}
      />
    </Box>
  );
};

export default PaginationControls;