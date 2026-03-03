import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, CheckSquare, AlertCircle } from 'lucide-react';
import { format } from '../utils/date';
import toast from 'react-hot-toast';

import { Note, Task, TaskStats } from '../types';
import { notesApi, tasksApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QuickNoteForm from '../components/QuickNoteForm';
import NoteCard from '../components/NoteCard';
import TaskCard from '../components/TaskCard';
import FunZone from '../components/FunZone';

const Home = () => {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载数据
      const [notes, tasks, stats] = await Promise.all([
        notesApi.getNotes(5, 0), // 获取最近5条笔记
        tasksApi.getTasks('pending'), // 获取待处理任务
        tasksApi.getTaskStats(), // 获取任务统计
      ]);

      setRecentNotes(notes);
      
      // 筛选出高优先级和即将到期的任务
      const urgent = tasks.filter(task => {
        if (task.priority === 'high') return true;
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          const today = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 3; // 3天内到期
        }
        return false;
      }).slice(0, 5); // 只显示前5个

      setUrgentTasks(urgent);
      setTaskStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = () => {
    loadData(); // 重新加载数据
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来</h1>
        <p className="text-gray-600">
          今天是 {format(new Date(), 'yyyy年MM月dd日 EEEE')}
        </p>
      </div>

      {/* 任务统计概览 */}
      {taskStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
            <div className="text-sm text-gray-600">总任务</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
            <div className="text-sm text-gray-600">待处理</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress}</div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
        </div>
      )}

      <FunZone username={user?.username} onInspirationSaved={handleNoteCreated} />

      {/* 快捷操作区 */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 快速记笔记 */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Plus className="text-primary-600" size={20} />
            <h2 className="text-lg font-semibold">快速记笔记</h2>
          </div>
          <QuickNoteForm onNoteCreated={handleNoteCreated} />
        </div>

        {/* 紧急任务 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-600" size={20} />
              <h2 className="text-lg font-semibold">紧急任务</h2>
            </div>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          {urgentTasks.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {urgentTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact onTaskUpdated={loadData} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>没有紧急任务</p>
            </div>
          )}
        </div>
      </div>

      {/* 最近笔记 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-primary-600" size={20} />
            <h2 className="text-lg font-semibold">最近笔记</h2>
          </div>
          <Link to="/notes" className="text-sm text-primary-600 hover:text-primary-700">
            查看全部
          </Link>
        </div>
        
        {recentNotes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">还没有笔记</p>
            <p className="text-sm">开始记录你的想法吧</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;