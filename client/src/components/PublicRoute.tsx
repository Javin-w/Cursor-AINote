import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 如果正在加载认证状态，显示加载器
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  // 如果已认证，重定向到指定页面或从哪里来回到哪里去
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // 如果未认证，渲染子组件（通常是登录页面）
  return <>{children}</>;
};

export default PublicRoute;