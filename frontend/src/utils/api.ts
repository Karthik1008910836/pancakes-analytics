import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse, 
  DailySales, 
  SalesFormData,
  MTDSummary,
  User,
  Outlet
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error(`API ${method} ${url} error:`, error);
      
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw {
        success: false,
        message: error.message || 'Network error occurred',
      };
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url);
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data);
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url);
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data);
  }
}

const apiClient = new ApiClient();

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post<AuthResponse['data']>('/auth/login', credentials) as Promise<AuthResponse>,
  
  register: (data: RegisterData): Promise<AuthResponse> =>
    apiClient.post<AuthResponse['data']>('/auth/register', data) as Promise<AuthResponse>,
  
  getProfile: (): Promise<ApiResponse<{ user: User }>> =>
    apiClient.get<{ user: User }>('/auth/profile'),
  
  updateProfile: (data: Partial<User>): Promise<ApiResponse<{ user: User }>> =>
    apiClient.put<{ user: User }>('/auth/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }): Promise<ApiResponse<any>> =>
    apiClient.put<any>('/auth/change-password', data),
};

export const salesApi = {
  createEntry: (data: SalesFormData): Promise<ApiResponse<DailySales>> =>
    apiClient.post<DailySales>('/sales', data),
  
  getEntries: (params?: {
    outlet_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<ApiResponse<{ entries: DailySales[]; pagination: any }>> =>
    apiClient.get<{ entries: DailySales[]; pagination: any }>(`/sales?${new URLSearchParams(params as any).toString()}`),
  
  getEntry: (id: number): Promise<ApiResponse<DailySales>> =>
    apiClient.get<DailySales>(`/sales/${id}`),
  
  updateEntry: (id: number, data: Partial<SalesFormData>): Promise<ApiResponse<DailySales>> =>
    apiClient.put<DailySales>(`/sales/${id}`, data),
  
  deleteEntry: (id: number): Promise<ApiResponse<any>> =>
    apiClient.delete<any>(`/sales/${id}`),
  
  checkExistingEntry: (params: { date: string; outlet_id: number }): Promise<ApiResponse<{
    exists: boolean;
    entry?: DailySales;
    hasPendingEditRequest?: boolean;
    canEdit?: boolean;
    canRequestEdit?: boolean;
    canCreate?: boolean;
  }>> =>
    apiClient.get<any>(`/sales/check-existing?${new URLSearchParams(params as any).toString()}`),
  
  getMTDSummary: (params: {
    year: number;
    month: number;
    outlet_id?: number;
  }): Promise<ApiResponse<{ summary: MTDSummary[]; period: { year: number; month: number } }>> =>
    apiClient.get<{ summary: MTDSummary[]; period: { year: number; month: number } }>(`/sales/mtd-summary?${new URLSearchParams(params as any).toString()}`),
  
  getDailyTrends: (params?: {
    start_date?: string;
    end_date?: string;
    days?: number;
  }): Promise<ApiResponse<{ trends: any[]; summary: any }>> =>
    apiClient.get<{ trends: any[]; summary: any }>(`/sales/daily-trends?${new URLSearchParams(params as any).toString()}`),
};

export const editRequestApi = {
  createEditRequest: (data: {
    daily_sales_id: number;
    reason: string;
    proposed_changes: any;
  }): Promise<ApiResponse<any>> =>
    apiClient.post<any>('/edit-requests', data),
  
  getEditRequests: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ requests: any[]; pagination: any }>> =>
    apiClient.get<any>(`/edit-requests?${new URLSearchParams(params as any).toString()}`),
  
  getEditRequest: (id: number): Promise<ApiResponse<any>> =>
    apiClient.get<any>(`/edit-requests/${id}`),
  
  reviewEditRequest: (id: number, data: {
    status: 'approved' | 'rejected';
    review_notes?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.put<any>(`/edit-requests/${id}/review`, data),
  
  cancelEditRequest: (id: number): Promise<ApiResponse<any>> =>
    apiClient.delete<any>(`/edit-requests/${id}`),
};

export const outletsApi = {
  getOutlets: (): Promise<ApiResponse<Outlet[]>> =>
    apiClient.get<Outlet[]>('/outlets'),
  
  createOutlet: (data: Partial<Outlet>): Promise<ApiResponse<Outlet>> =>
    apiClient.post<Outlet>('/outlets', data),
  
  updateOutlet: (id: number, data: Partial<Outlet>): Promise<ApiResponse<Outlet>> =>
    apiClient.put<Outlet>(`/outlets/${id}`, data),
  
  deleteOutlet: (id: number): Promise<ApiResponse<any>> =>
    apiClient.delete<any>(`/outlets/${id}`),
};

export const usersApi = {
  getUsers: (): Promise<ApiResponse<User[]>> =>
    apiClient.get<User[]>('/users'),
  
  getUser: (id: number): Promise<ApiResponse<User>> =>
    apiClient.get<User>(`/users/${id}`),
  
  createUser: (data: RegisterData): Promise<ApiResponse<User>> =>
    apiClient.post<User>('/users', data),
  
  updateUser: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/users/${id}`, data),
  
  toggleUserStatus: (id: number): Promise<ApiResponse<User>> =>
    apiClient.patch<User>(`/users/${id}/toggle-status`),
  
  deleteUser: (id: number): Promise<ApiResponse<any>> =>
    apiClient.delete<any>(`/users/${id}`),
};

export default apiClient;