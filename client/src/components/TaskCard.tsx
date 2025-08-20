import { useState } from 'react';
import { format } from '../utils/date';
import { Clock, AlertCircle, CheckCircle, Pause, Play } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Task } from '../types';
import { tasksApi } from '../services/api';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onTaskUpdated?: () => void;
}

const TaskCard = ({ task, compact = false, onTaskUpdated }: TaskCardProps) => {
  const [loading, setLoading] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in_progress': return <Pause size={16} />;
      case 'pending': return <Play size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'pending': return '待处理';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      setLoading(true);
      await tasksApi.updateTask(task.id, { status: newStatus });
      toast.success('任务状态更新成功');
      onTaskUpdated?.();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className={clsx('task-card', compact && 'p-3')}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={clsx(
              'font-medium text-gray-900 line-clamp-1',
              compact ? 'text-sm' : 'text-base'
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className={clsx(
                'text-gray-600 mt-1 line-clamp-2',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            <span className={clsx(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
              getPriorityColor(task.priority)
            )}>
              {getPriorityText(task.priority)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const nextStatus = task.status === 'pending' ? 'in_progress' : 
                                 task.status === 'in_progress' ? 'completed' : 'pending';
                handleStatusChange(nextStatus);
              }}
              disabled={loading}
              className={clsx(
                'flex items-center space-x-1 text-sm transition-colors disabled:opacity-50',
                getStatusColor(task.status),
                'hover:opacity-75'
              )}
            >
              {getStatusIcon(task.status)}
              <span>{getStatusText(task.status)}</span>
            </button>

            {task.due_date && (
              <div className={clsx(
                'flex items-center space-x-1 text-xs',
                isOverdue ? 'text-red-600' : 'text-gray-500'
              )}>
                {isOverdue && <AlertCircle size={12} />}
                <Clock size={12} />
                <span>
                  {format(new Date(task.due_date), 'MM-dd HH:mm')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;