import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Skeleton,
  Alert,
  Box,
  Chip,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import { DailySales } from '../types';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from './PaginationControls';

interface OptimizedDataTableProps {
  data: DailySales[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPaginationChange?: (page: number, limit: number) => void;
}

type SortField = 'date' | 'net_sale' | 'gross_sale' | 'total_tickets' | 'apc';
type SortOrder = 'asc' | 'desc';

const OptimizedDataTable: React.FC<OptimizedDataTableProps> = ({
  data,
  loading,
  error,
  onRefresh,
  pagination,
  onPaginationChange
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const {
    pagination: localPagination,
    updatePagination,
    goToPage,
    changeLimit
  } = usePagination({ initialLimit: 50 });

  // Use provided pagination or local pagination
  const currentPagination = pagination || localPagination;

  useEffect(() => {
    if (pagination) {
      updatePagination(pagination);
    }
  }, [pagination, updatePagination]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handlePageChange = (page: number) => {
    if (onPaginationChange) {
      onPaginationChange(page, currentPagination.limit);
    } else {
      goToPage(page);
    }
  };

  const handleLimitChange = (limit: number) => {
    if (onPaginationChange) {
      onPaginationChange(1, limit);
    } else {
      changeLimit(limit);
    }
  };

  const sortedData = useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortField, sortOrder]);

  if (error) {
    return (
      <Alert severity="error" action={onRefresh && (
        <button onClick={onRefresh}>Retry</button>
      )}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'date'}
                  direction={sortField === 'date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'gross_sale'}
                  direction={sortField === 'gross_sale' ? sortOrder : 'asc'}
                  onClick={() => handleSort('gross_sale')}
                >
                  Gross Sale (₹)
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'net_sale'}
                  direction={sortField === 'net_sale' ? sortOrder : 'asc'}
                  onClick={() => handleSort('net_sale')}
                >
                  Net Sale (₹)
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'total_tickets'}
                  direction={sortField === 'total_tickets' ? sortOrder : 'asc'}
                  onClick={() => handleSort('total_tickets')}
                >
                  Tickets
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'apc'}
                  direction={sortField === 'apc' ? sortOrder : 'asc'}
                  onClick={() => handleSort('apc')}
                >
                  APC (₹)
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Products</TableCell>
              <TableCell align="right">Target Achievement</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No sales data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => {
                const achievementPercentage = row.daily_target > 0 
                  ? (row.net_sale / row.daily_target * 100) 
                  : 0;
                
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      {format(new Date(row.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      ₹{parseFloat(row.gross_sale.toString()).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="right">
                      <strong>₹{parseFloat(row.net_sale.toString()).toLocaleString('en-IN')}</strong>
                    </TableCell>
                    <TableCell align="right">
                      {row.total_tickets}
                      {row.offline_tickets > 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          ({row.offline_tickets} offline)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ₹{row.apc?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip 
                          label={`${row.cakes_sold} cakes`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${row.pastries_sold} pastries`} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${achievementPercentage.toFixed(1)}%`}
                        color={
                          achievementPercentage >= 100 ? 'success' :
                          achievementPercentage >= 80 ? 'warning' : 'error'
                        }
                        size="small"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Target: ₹{parseFloat(row.daily_target.toString()).toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationControls
        pagination={currentPagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
      />
    </Box>
  );
};

export default OptimizedDataTable;