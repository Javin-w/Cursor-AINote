import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckSquare, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tasksApi, notesApi } from '../services/api';
import { Task, Note } from '../types';

const Home = () => {
  const { user } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // 加载最近的任务和笔记
        const [tasksResponse, notesResponse] = await Promise.all([
          tasksApi.getTasks({ limit: 5 }),
          notesApi.getNotes({ limit: 5 }),
        ]);

        setRecentTasks(tasksResponse.data);
        setRecentNotes(notesResponse.data);

        // 计算统计数据
        const allTasksResponse = await tasksApi.getTasks({ limit: 1000 });
        const allTasks = allTasksResponse.data;
        const completedTasks = allTasks.filter(task => task.status === 'completed').length;

        setStats({
          totalTasks: allTasks.length,
          completedTasks,
          totalNotes: notesResponse.pagination.total,
        });
      } catch (error) {
        console.error('加载仪表板数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '无';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 欢迎信息 */}
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              欢迎回来，{user?.username}！
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              这是您的个人工作台，管理您的笔记和任务
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">任务总数</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">已完成</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">笔记总数</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalNotes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近任务 */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">最近任务</h2>
                <Link
                  to="/tasks"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  查看全部
                </Link>
              </div>
            </div>
            <div className="card-content">
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无任务</h3>
                  <p className="mt-1 text-sm text-gray-500">创建您的第一个任务开始使用</p>
                  <Link
                    to="/tasks"
                    className="mt-3 inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>新建任务</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 最近笔记 */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">最近笔记</h2>
                <Link
                  to="/notes"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  查看全部
                </Link>
              </div>
            </div>
            <div className="card-content">
              {recentNotes.length > 0 ? (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{note.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {note.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无笔记</h3>
                  <p className="mt-1 text-sm text-gray-500">创建您的第一篇笔记开始记录</p>
                  <Link
                    to="/notes"
                    className="mt-3 inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>新建笔记</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;