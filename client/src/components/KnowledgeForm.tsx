import { useState } from 'react';
import { X, Save, Tag, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import { KnowledgeItem } from '../types';
import { knowledgeApi } from '../services/api';

interface KnowledgeFormProps {
  item?: KnowledgeItem;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
}

const KnowledgeForm = ({ item, onClose, onCreated, onUpdated }: KnowledgeFormProps) => {
  const [title, setTitle] = useState(item?.title || '');
  const [summary, setSummary] = useState(item?.summary || '');
  const [content, setContent] = useState(item?.content || '');
  const [category, setCategory] = useState(item?.category || '未分类');
  const [sourceUrl, setSourceUrl] = useState(item?.source_url || '');
  const [status, setStatus] = useState<KnowledgeItem['status']>(item?.status || 'draft');
  const [isFavorite, setIsFavorite] = useState(item?.is_favorite || false);
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('请填写标题和正文内容');
      return;
    }

    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      content: content.trim(),
      category: category.trim() || '未分类',
      source_url: sourceUrl.trim() || undefined,
      status,
      is_favorite: isFavorite,
      tags: tags.filter((tag) => tag.trim() !== ''),
    };

    try {
      setLoading(true);
      if (item) {
        await knowledgeApi.updateKnowledgeItem(item.id, payload);
        toast.success('知识条目更新成功');
        onUpdated?.();
      } else {
        await knowledgeApi.createKnowledgeItem(payload);
        toast.success('知识条目创建成功');
        onCreated?.();
      }
      onClose();
    } catch (error) {
      console.error('保存知识条目失败:', error);
      toast.error('保存知识条目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (!value || tags.includes(value)) {
        setTagInput('');
        return;
      }
      setTags([...tags, value]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">{item ? '编辑知识条目' : '新建知识条目'}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="例如：React 性能优化清单"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="textarea"
                placeholder="一句话总结这个知识条目"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">正文内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="textarea"
                placeholder="记录完整笔记、原理、实践步骤..."
                disabled={loading}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                  placeholder="如：前端工程化"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KnowledgeItem['status'])}
                  className="input"
                  disabled={loading}
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">来源链接</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="input"
                placeholder="https://..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
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
                  className="input"
                  placeholder="输入标签后按回车键添加"
                  disabled={loading}
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                disabled={loading}
              />
              <Star size={14} className="text-yellow-500" />
              标记为收藏
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
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

export default KnowledgeForm;
