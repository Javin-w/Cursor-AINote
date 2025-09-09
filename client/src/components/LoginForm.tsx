import { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginRequest, RegisterRequest } from '../types';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, register, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 登录表单状态
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 处理登录提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      return;
    }

    try {
      await login(loginForm);
      onSuccess?.();
    } catch (error) {
      // 错误已经在AuthContext中处理
    }
  };

  // 处理注册提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.username.trim() || !registerForm.email.trim() || 
        !registerForm.password.trim() || !registerForm.confirmPassword.trim()) {
      return;
    }

    try {
      await register(registerForm);
      onSuccess?.();
    } catch (error) {
      // 错误已经在AuthContext中处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRegisterMode ? '创建新账户' : '登录到智能笔记'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegisterMode ? '填写信息注册新账户' : '使用您的账户凭据登录'}
          </p>
        </div>

        {!isRegisterMode ? (
          // 登录表单
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="请输入用户名"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="input pr-10"
                    placeholder="请输入密码"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !loginForm.username.trim() || !loginForm.password.trim()}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                <LogIn size={16} />
                <span>{isLoading ? '登录中...' : '登录'}</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                还没有账户？点击注册
              </button>
            </div>
          </form>
        ) : (
          // 注册表单
          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, username: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="请输入用户名"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="请输入邮箱地址"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <div className="mt-1 relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, password: e.target.value })
                    }
                    className="input pr-10"
                    placeholder="请输入密码"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  确认密码
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                    }
                    className="input pr-10"
                    placeholder="请确认密码"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {registerForm.password && registerForm.confirmPassword && 
                 registerForm.password !== registerForm.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">密码不匹配</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !registerForm.username.trim() || 
                  !registerForm.email.trim() ||
                  !registerForm.password.trim() || 
                  !registerForm.confirmPassword.trim() ||
                  registerForm.password !== registerForm.confirmPassword
                }
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                <UserPlus size={16} />
                <span>{isLoading ? '注册中...' : '注册'}</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                已有账户？点击登录
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;