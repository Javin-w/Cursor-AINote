import { useEffect, useState } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { Note } from '../types';
import { notesApi } from '../services/api';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchNotes();
    } else {
      loadNotes();
    }
  }, [searchQuery]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('加载笔记失败:', error);
      toast.error('加载笔记失败');
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.searchNotes(searchQuery.trim());
      setNotes(data);
    } catch (error) {
      console.error('搜索笔记失败:', error);
      toast.error('搜索笔记失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = () => {
    setShowForm(false);
    loadNotes();
  };

  if (loading && notes.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">我的笔记</h1>
          <p className="text-gray-600">记录想法，整理思维</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>新建笔记</span>
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="搜索笔记..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* 笔记列表 */}
      {notes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? '没有找到相关笔记' : '还没有笔记'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? '尝试使用不同的关键词搜索' : '开始记录你的想法和灵感吧'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              创建第一个笔记
            </button>
          )}
        </div>
      )}

      {/* 笔记创建表单模态框 */}
      {showForm && (
        <NoteForm
          onClose={() => setShowForm(false)}
          onNoteCreated={handleNoteCreated}
        />
      )}
    </div>
  );
};

export default Notes;