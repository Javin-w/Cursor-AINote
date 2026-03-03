import { Link, useLocation } from 'react-router-dom';
import { BookOpen, CheckSquare, Home, Library, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/notes', icon: BookOpen, label: '笔记' },
    { path: '/tasks', icon: CheckSquare, label: '任务' },
    { path: '/knowledge', icon: Library, label: '知识库' },
  ];

  const isPathActive = (path: string) => (
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary-600">
              AI笔记
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isPathActive(path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>欢迎，{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>退出</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <div className="text-sm text-gray-500">
                个人笔记和任务管理
              </div>
            </div>
          )}
        </div>

        {/* 移动端导航 */}
        {isAuthenticated && (
          <div className="md:hidden border-t border-gray-200">
            <div className="flex items-center justify-around py-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'flex flex-col items-center space-y-1 p-2 rounded-lg text-xs transition-colors',
                    isPathActive(path)
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  )}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
              <button
                onClick={logout}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg text-xs text-gray-600"
              >
                <LogOut size={20} />
                <span>退出</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;