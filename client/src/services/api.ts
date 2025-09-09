import { 
  User, 
  Task, 
  Note, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  PaginatedResponse 
} from '../types';

// API基础配置
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `请求失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API请求错误 [${endpoint}]:`, error);
      throw error instanceof Error ? error : new Error('网络请求失败');
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  // POST请求
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();

// 认证API
export const authApi = {
  // 登录
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  // 注册
  async register(userData: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  // 刷新令牌
  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', {});
  },

  // 登出
  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout', {});
  },
};

// 任务API
export const tasksApi = {
  // 获取任务列表
  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Task>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    
    const queryString = query.toString();
    return apiClient.get<PaginatedResponse<Task>>(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  // 获取单个任务
  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  // 创建任务
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> {
    return apiClient.post<Task>('/tasks', taskData);
  },

  // 更新任务
  async updateTask(id: string, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, taskData);
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};

// 笔记API
export const notesApi = {
  // 获取笔记列表
  async getNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<Note>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => query.append('tags', tag));
    
    const queryString = query.toString();
    return apiClient.get<PaginatedResponse<Note>>(`/notes${queryString ? `?${queryString}` : ''}`);
  },

  // 获取单个笔记
  async getNote(id: string): Promise<Note> {
    return apiClient.get<Note>(`/notes/${id}`);
  },

  // 创建笔记
  async createNote(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Note> {
    return apiClient.post<Note>('/notes', noteData);
  },

  // 更新笔记
  async updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Note> {
    return apiClient.put<Note>(`/notes/${id}`, noteData);
  },

  // 删除笔记
  async deleteNote(id: string): Promise<void> {
    return apiClient.delete<void>(`/notes/${id}`);
  },
};

export default apiClient;