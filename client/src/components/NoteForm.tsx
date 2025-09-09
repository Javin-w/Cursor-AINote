import { useState } from 'react';
import { X, Save, Tag, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { notesApi } from '../services/api';
import { Note } from '../types';

interface NoteFormProps {
  note?: Note;
  onClose: () => void;
  onNoteCreated?: () => void;
  onNoteUpdated?: () => void;
}

const NoteForm = ({ note, onClose, onNoteCreated, onNoteUpdated }: NoteFormProps) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('请填写笔记标题');
      return;
    }

    if (!content.trim()) {
      toast.error('请填写笔记内容');
      return;
    }

    try {
      setLoading(true);
      
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.filter(tag => tag.trim() !== ''),
      };
      
      if (note) {
        // 更新笔记
        await notesApi.updateNote(note.id, noteData);
        toast.success('笔记更新成功');
        onNoteUpdated?.();
      } else {
        // 创建笔记
        await notesApi.createNote(noteData);
        toast.success('笔记创建成功');
        onNoteCreated?.();
      }
      
      onClose();
    } catch (error) {
      console.error('保存笔记失败:', error);
      toast.error('保存笔记失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tagText = newTag.trim();
    if (!tags.includes(tagText)) {
      setTags([...tags, tagText]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {note ? '编辑笔记' : '新建笔记'}
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
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* 笔记标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                笔记标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入笔记标题..."
                className="input"
                required
                disabled={loading}
              />
            </div>

            {/* 标签管理 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              
              {/* 现有标签显示 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 添加新标签 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入新标签..."
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-outline flex items-center space-x-1 px-3"
                  disabled={loading || !newTag.trim()}
                >
                  <Plus size={14} />
                  <span>添加</span>
                </button>
              </div>
            </div>

            {/* 笔记内容 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                笔记内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始记录您的想法..."
                rows={12}
                className="textarea resize-none"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 底部 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {content.length} 字符
            </div>
            <div className="flex items-center space-x-3">
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
                disabled={loading || !title.trim() || !content.trim()}
              >
                <Save size={16} />
                <span>{loading ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;