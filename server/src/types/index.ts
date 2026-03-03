export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeItem {
  id: string;
  user_id: string;
  title: string;
  summary?: string;
  content: string;
  category?: string;
  tags?: string[];
  source_url?: string;
  status: 'draft' | 'published' | 'archived';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface CreateKnowledgeItemRequest {
  title: string;
  summary?: string;
  content: string;
  category?: string;
  tags?: string[];
  source_url?: string;
  status?: 'draft' | 'published' | 'archived';
  is_favorite?: boolean;
}

export interface UpdateKnowledgeItemRequest {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  tags?: string[];
  source_url?: string;
  status?: 'draft' | 'published' | 'archived';
  is_favorite?: boolean;
}

// 认证相关类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}