import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: User; token: string } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'UPDATE_TOKEN'; payload: string };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'UPDATE_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化时检查本地存储的认证信息
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // 验证令牌是否仍然有效
          await authApi.me();
          dispatch({ type: 'SET_AUTHENTICATED', payload: { user, token } });
        } catch (error) {
          // 令牌无效，清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      } else {
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.login(data);
      
      // 保存到本地存储
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: { user: response.user, token: response.token },
      });
      
      toast.success('登录成功');
      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      const message = error.response?.data?.error || '登录失败';
      toast.error(message);
      return false;
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.register(data);
      
      // 保存到本地存储
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: { user: response.user, token: response.token },
      });
      
      toast.success('注册成功');
      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      const message = error.response?.data?.error || '注册失败';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'SET_UNAUTHENTICATED' });
    toast.success('已退出登录');
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refresh();
      localStorage.setItem('token', response.token);
      dispatch({ type: 'UPDATE_TOKEN', payload: response.token });
    } catch (error) {
      logout();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};