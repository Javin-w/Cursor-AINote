import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  Calendar,
  Flag
} from 'lucide-react';
import { Task } from '../types';
import { tasksApi } from '../services/api';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdate: () => void;
}

const TaskCard = ({ task, onEdit, onDelete, onUpdate }: TaskCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      setLoading(true);
      await tasksApi.updateTask(task.id, { status: newStatus });
      toast.success('任务状态已更新');
      onUpdate();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      default: return '待处理';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = () => {
    switch (task.priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '无';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = () => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 标题和状态 */}
            <div className="flex items-center space-x-3 mb-2">
              <button
                onClick={() => {
                  const nextStatus = 
                    task.status === 'pending' ? 'in_progress' :
                    task.status === 'in_progress' ? 'completed' :
                    'pending';
                  handleStatusChange(nextStatus);
                }}
                disabled={loading}
                className="flex-shrink-0 hover:scale-110 transition-transform"
              >
                {getStatusIcon()}
              </button>
              <h3 className={`text-lg font-semibold ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
            </div>

            {/* 描述 */}
            {task.description && (
              <p className="text-gray-600 mb-3 ml-8">
                {task.description}
              </p>
            )}

            {/* 元数据 */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 ml-8">
              {/* 状态 */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {getStatusText()}
              </span>

              {/* 优先级 */}
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor()}`}>
                <Flag className="w-3 h-3 mr-1" />
                {getPriorityText()}优先级
              </span>

              {/* 截止时间 */}
              {task.due_date && (
                <span className={`flex items-center ${isOverdue() ? 'text-red-600' : 'text-gray-500'}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(task.due_date)}
                  {isOverdue() && <span className="ml-1 text-red-600 font-medium">(已逾期)</span>}
                </span>
              )}

              {/* 创建时间 */}
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                创建于 {formatDate(task.created_at)}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="编辑任务"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="删除任务"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;