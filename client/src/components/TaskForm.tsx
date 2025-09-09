import { useState } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { tasksApi } from '../services/api';
import { Task } from '../types';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
}

const TaskForm = ({ task, onClose, onTaskCreated, onTaskUpdated }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('请填写任务标题');
      return;
    }

    try {
      setLoading(true);
      
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: task?.status || 'pending' as const,
      };
      
      if (task) {
        // 更新任务
        await tasksApi.updateTask(task.id, taskData);
        toast.success('任务更新成功');
        onTaskUpdated?.();
      } else {
        // 创建任务
        await tasksApi.createTask(taskData);
        toast.success('任务创建成功');
        onTaskCreated?.();
      }
      
      onClose();
    } catch (error) {
      console.error('保存任务失败:', error);
      toast.error('保存任务失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {task ? '编辑任务' : '新建任务'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务标题..."
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="详细描述任务内容..."
                rows={3}
                className="textarea"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优先级
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="input"
                  disabled={loading}
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  截止时间
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center space-x-2"
              disabled={loading || !title.trim()}
            >
              <Save size={16} />
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;