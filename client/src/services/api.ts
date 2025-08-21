import axios from 'axios';
import { Note, Task, CreateNoteRequest, UpdateNoteRequest, CreateTaskRequest, UpdateTaskRequest, TaskStats, LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 自动添加认证令牌
api.interceptors.request.use(
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

// 响应拦截器 - 处理认证失败
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 笔记相关API
export const notesApi = {
  // 获取所有笔记
  getNotes: async (limit?: number, offset?: number): Promise<Note[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get(`/notes?${params}`);
    return response.data;
  },

  // 获取单个笔记
  getNote: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // 创建笔记
  createNote: async (note: CreateNoteRequest): Promise<Note> => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  // 更新笔记
  updateNote: async (id: string, note: UpdateNoteRequest): Promise<void> => {
    await api.put(`/notes/${id}`, note);
  },

  // 删除笔记
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  // 搜索笔记
  searchNotes: async (query: string): Promise<Note[]> => {
    const response = await api.get(`/notes/search/${encodeURIComponent(query)}`);
    return response.data;
  },
};

// 任务相关API
export const tasksApi = {
  // 获取所有任务
  getTasks: async (status?: string, priority?: string): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    const response = await api.get(`/tasks?${params}`);
    return response.data;
  },

  // 获取单个任务
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // 创建任务
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // 更新任务
  updateTask: async (id: string, task: UpdateTaskRequest): Promise<void> => {
    await api.put(`/tasks/${id}`, task);
  },

  // 删除任务
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // 获取任务统计
  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },
};

// 认证相关API
export const authApi = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // 获取当前用户信息
  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 刷新令牌
  refresh: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// API健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};

export default api;