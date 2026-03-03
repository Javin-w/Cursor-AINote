import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Tag, Clock } from 'lucide-react';
import { format } from '../utils/date';
import toast from 'react-hot-toast';

import { Note } from '../types';
import { notesApi } from '../services/api';
import NoteForm from '../components/NoteForm';

const NotePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await notesApi.getNote(id);
      setNote(data);
    } catch (error) {
      console.error('加载笔记失败:', error);
      toast.error('加载笔记失败');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm('确定要删除这篇笔记吗？此操作无法撤销。')) {
      return;
    }

    try {
      setDeleting(true);
      await notesApi.deleteNote(note.id);
      toast.success('笔记删除成功');
      navigate('/notes');
    } catch (error) {
      console.error('删除笔记失败:', error);
      toast.error('删除笔记失败');
    } finally {
      setDeleting(false);
    }
  };

  const handleNoteUpdated = () => {
    setShowEditForm(false);
    loadNote();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">笔记不存在</h2>
        <p className="text-gray-600 mb-6">该笔记可能已被删除或不存在</p>
        <Link to="/notes" className="btn btn-primary">
          返回笔记列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/notes"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回笔记列表</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEditForm(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>编辑</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-danger flex items-center space-x-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>{deleting ? '删除中...' : '删除'}</span>
          </button>
        </div>
      </div>

      {/* 笔记内容 */}
      <article className="card">
        <header className="mb-6 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {note.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>创建于 {format(new Date(note.created_at), 'yyyy年MM月dd日 HH:mm')}</span>
              </div>
              {note.updated_at !== note.created_at && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>更新于 {format(new Date(note.updated_at), 'yyyy年MM月dd日 HH:mm')}</span>
                </div>
              )}
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag size={14} className="text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {note.content}
          </div>
        </div>
      </article>

      {/* 编辑表单模态框 */}
      {showEditForm && (
        <NoteForm
          note={note}
          onClose={() => setShowEditForm(false)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </div>
  );
};

export default NotePage;