import { useState } from 'react';
import { X, Save, Tag } from 'lucide-react';
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
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      setLoading(true);
      
      if (note) {
        // 更新笔记
        await notesApi.updateNote(note.id, {
          title: title.trim(),
          content: content.trim(),
          tags: tags.filter(tag => tag.trim() !== ''),
        });
        toast.success('笔记更新成功');
        onNoteUpdated?.();
      } else {
        // 创建笔记
        await notesApi.createNote({
          title: title.trim(),
          content: content.trim(),
          tags: tags.filter(tag => tag.trim() !== ''),
        });
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

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里记录你的想法..."
                rows={12}
                className="textarea"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="输入标签后按回车键添加..."
                  className="input"
                  disabled={loading}
                />
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
              disabled={loading || !title.trim() || !content.trim()}
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

export default NoteForm;