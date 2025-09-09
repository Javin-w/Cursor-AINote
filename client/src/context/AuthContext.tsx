import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';
import { authApi } from '../services/api';

// 认证状态类型
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 认证动作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

// 初始状态
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  isAuthenticated: false,
};

// 状态处理器
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 登录函数
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authApi.login(credentials);
      
      // 存储令牌到localStorage
      localStorage.setItem('auth_token', response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success(`欢迎回来，${response.user.username}！`);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      localStorage.removeItem('auth_token');
      
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // 注册函数
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // 检查密码确认
      if (userData.password !== userData.confirmPassword) {
        throw new Error('密码确认不匹配');
      }

      // 移除确认密码字段
      const { confirmPassword, ...registerData } = userData;
      const response = await authApi.register(registerData);
      
      // 存储令牌到localStorage
      localStorage.setItem('auth_token', response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success(`注册成功，欢迎 ${response.user.username}！`);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      localStorage.removeItem('auth_token');
      
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // 登出函数
  const logout = useCallback(async () => {
    try {
      // 调用后端登出接口（可选）
      await authApi.logout();
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 无论后端请求是否成功，都要清理本地状态
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('已成功登出');
    }
  }, []);

  // 刷新令牌函数
  const refreshToken = useCallback(async () => {
    try {
      const response = await authApi.refreshToken();
      
      localStorage.setItem('auth_token', response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (error) {
      console.error('刷新令牌失败:', error);
      logout();
    }
  }, [logout]);

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 验证令牌并获取用户信息
        const user = await authApi.getCurrentUser();
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        console.error('初始化认证失败:', error);
        localStorage.removeItem('auth_token');
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  // 令牌自动刷新（可选实现）
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    // 每30分钟尝试刷新令牌
    const interval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token, refreshToken]);

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的钩子
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;