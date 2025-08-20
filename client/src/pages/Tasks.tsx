import { useEffect, useState } from 'react';
import { Plus, Filter, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import { Task } from '../types';
import { tasksApi } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getTasks(statusFilter || undefined, priorityFilter || undefined);
      setTasks(data);
    } catch (error) {
      console.error('加载任务失败:', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowForm(false);
    loadTasks();
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的任务</h1>
          <p className="text-gray-600">管理和跟踪你的待办事项</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>新建任务</span>
        </button>
      </div>

      {/* 筛选器 */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">筛选任务</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              优先级
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input"
            >
              <option value="">全部优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskUpdated={loadTasks} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter || priorityFilter ? '没有符合条件的任务' : '还没有任务'}
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter || priorityFilter 
              ? '尝试调整筛选条件或创建新任务' 
              : '开始创建你的第一个任务吧'
            }
          </p>
          {!(statusFilter || priorityFilter) && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              创建第一个任务
            </button>
          )}
        </div>
      )}

      {/* 任务创建表单模态框 */}
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Tasks;