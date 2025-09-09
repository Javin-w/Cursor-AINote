// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 认证响应类型
export interface AuthResponse {
  user: User;
  token: string;
}

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// 笔记相关类型
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 认证上下文类型
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}