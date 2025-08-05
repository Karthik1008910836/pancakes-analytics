import { useState } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
}

export const usePagination = ({ initialPage = 1, initialLimit = 50 }: UsePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const [loading, setLoading] = useState(false);

  const updatePagination = (newPagination: Partial<PaginationState>) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  };

  const prevPage = () => {
    if (pagination.hasPrev) {
      setPagination(prev => ({
        ...prev,
        page: prev.page - 1
      }));
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page
      }));
    }
  };

  const changeLimit = (limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit,
      page: 1 // Reset to first page when changing limit
    }));
  };

  const getQueryParams = () => ({
    page: pagination.page,
    limit: pagination.limit
  });

  return {
    pagination,
    loading,
    setLoading,
    updatePagination,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    getQueryParams
  };
};