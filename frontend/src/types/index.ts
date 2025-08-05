export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'normal';
  outlet_id?: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
  outlet?: Outlet;
  created_at: string;
  updated_at: string;
}

export interface Outlet {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailySales {
  id: number;
  date: string;
  outlet_id: number;
  mtd_target: number;
  daily_target: number;
  gross_sale: number;
  net_sale: number;
  total_tickets: number;
  offline_net_sale: number;
  offline_tickets: number;
  apc: number;
  cakes_sold: number;
  pastries_sold: number;
  entered_by: number;
  outlet?: Outlet;
  enteredBy?: User;
  created_at: string;
  updated_at: string;
}

export interface MonthlyTarget {
  id: number;
  outlet_id: number;
  year: number;
  month: number;
  target_amount: number;
  daily_target: number;
  created_by: number;
  outlet?: Outlet;
  createdBy?: User;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'normal';
  outlet_id?: number;
  first_name: string;
  last_name: string;
}

export interface SalesFormData {
  date: string;
  outlet_id: number;
  mtd_target: number;
  daily_target: number;
  gross_sale: number;
  net_sale: number;
  total_tickets: number;
  offline_net_sale: number;
  offline_tickets: number;
  cakes_sold: number;
  pastries_sold: number;
}

export interface MTDSummary {
  outlet: Outlet;
  total_net_sale: number;
  total_gross_sale: number;
  total_tickets: number;
  total_cakes: number;
  total_pastries: number;
  days_reported: number;
  avg_apc: number;
  mtd_target: number;
  achievement_percentage: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}