import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Edit, Trash2, Tag } from 'lucide-react';
import { notesApi } from '../services/api';
import { Note } from '../types';
import NoteForm from '../components/NoteForm';
import toast from 'react-hot-toast';

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [allTags, setAllTags] = useState<string[]>([]);

  // 加载笔记列表
  const loadNotes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedTags.length > 0) {
        params.tags = selectedTags;
      }

      const response = await notesApi.getNotes(params);
      setNotes(response.data);

      // 提取所有标签
      const tags = new Set<string>();
      response.data.forEach(note => {
        note.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('加载笔记失败:', error);
      toast.error('加载笔记失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadNotes();
    }, 300); // 防抖处理

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTags]);

  const handleCreateNote = () => {
    setEditingNote(undefined);
    setShowNoteForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleCloseForm = () => {
    setShowNoteForm(false);
    setEditingNote(undefined);
  };

  const handleNoteCreated = () => {
    loadNotes();
  };

  const handleNoteUpdated = () => {
    loadNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('确定要删除这篇笔记吗？')) {
      return;
    }

    try {
      await notesApi.deleteNote(noteId);
      toast.success('笔记删除成功');
      loadNotes();
    } catch (error) {
      console.error('删除笔记失败:', error);
      toast.error('删除笔记失败');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
              <h1 className="text-3xl font-bold text-gray-900">笔记管理</h1>
              <p className="mt-2 text-gray-600">记录您的想法和知识</p>
            </div>
            <button
              onClick={handleCreateNote}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>新建笔记</span>
            </button>
          </div>
        </div>

        {/* 搜索和标签过滤 */}
        <div className="card mb-6">
          <div className="card-content">
            {/* 搜索框 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索笔记标题或内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* 标签过滤 */}
            {allTags.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">标签筛选：</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      清除筛选
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 笔记列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="card hover:shadow-md transition-shadow">
                <div className="card-content">
                  {/* 笔记标题 */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="编辑笔记"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="删除笔记"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 笔记内容预览 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateContent(note.content)}
                  </p>

                  {/* 标签 */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 时间信息 */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>创建：{formatDate(note.created_at)}</div>
                    {note.updated_at !== note.created_at && (
                      <div>更新：{formatDate(note.updated_at)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="card">
                <div className="card-content text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery || selectedTags.length > 0
                      ? '没有找到匹配的笔记'
                      : '暂无笔记'}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery || selectedTags.length > 0
                      ? '尝试调整搜索条件或标签筛选'
                      : '创建您的第一篇笔记开始记录'}
                  </p>
                  {!searchQuery && selectedTags.length === 0 && (
                    <button
                      onClick={handleCreateNote}
                      className="mt-4 btn btn-primary flex items-center space-x-2 mx-auto"
                    >
                      <Plus size={16} />
                      <span>新建笔记</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 笔记表单模态框 */}
      {showNoteForm && (
        <NoteForm
          note={editingNote}
          onClose={handleCloseForm}
          onNoteCreated={handleNoteCreated}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </div>
  );
};

export default Notes;