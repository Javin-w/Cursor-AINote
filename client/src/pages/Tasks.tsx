import { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckSquare, Square, Clock } from 'lucide-react';
import { tasksApi } from '../services/api';
import { Task } from '../types';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }

      const response = await tasksApi.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('加载任务失败:', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  // 过滤任务
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 统计信息
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleTaskCreated = () => {
    loadTasks();
  };

  const handleTaskUpdated = () => {
    loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('确定要删除这个任务吗？')) {
      return;
    }

    try {
      await tasksApi.deleteTask(taskId);
      toast.success('任务删除成功');
      loadTasks();
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
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
        {/* 页面标题和操作栏 */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">任务管理</h1>
              <p className="mt-2 text-gray-600">管理您的待办事项和任务进度</p>
            </div>
            <button
              onClick={handleCreateTask}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>新建任务</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总任务</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Square className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和过滤器 */}
        <div className="card mb-6">
          <div className="card-content">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 搜索 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* 状态过滤器 */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input pl-10 pr-8"
                >
                  <option value="all">所有状态</option>
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              {/* 优先级过滤器 */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">所有优先级</option>
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onUpdate={loadTasks}
              />
            ))
          ) : (
            <div className="card">
              <div className="card-content text-center py-12">
                <CheckSquare className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? '没有找到匹配的任务'
                    : '暂无任务'}
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? '尝试调整搜索条件或过滤器'
                    : '创建您的第一个任务开始管理工作'}
                </p>
                {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                  <button
                    onClick={handleCreateTask}
                    className="mt-4 btn btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <Plus size={16} />
                    <span>新建任务</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 任务表单模态框 */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default Tasks;