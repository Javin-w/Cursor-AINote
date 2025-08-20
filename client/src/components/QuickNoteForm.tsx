import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { notesApi } from '../services/api';

interface QuickNoteFormProps {
  onNoteCreated?: () => void;
}

const QuickNoteForm = ({ onNoteCreated }: QuickNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      setLoading(true);
      await notesApi.createNote({
        title: title.trim(),
        content: content.trim(),
      });
      
      toast.success('笔记创建成功');
      setTitle('');
      setContent('');
      onNoteCreated?.();
    } catch (error) {
      console.error('创建笔记失败:', error);
      toast.error('创建笔记失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="笔记标题..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
        disabled={loading}
      />
      
      <textarea
        placeholder="在这里记录你的想法..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="textarea"
        disabled={loading}
      />
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          <span>{loading ? '保存中...' : '保存笔记'}</span>
        </button>
      </div>
    </form>
  );
};

export default QuickNoteForm;