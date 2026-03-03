import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Star, Tag, FolderOpen, Link as LinkIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import { KnowledgeItem } from '../types';
import { knowledgeApi } from '../services/api';
import { format } from '../utils/date';
import KnowledgeForm from '../components/KnowledgeForm';

const statusText: Record<KnowledgeItem['status'], string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

const statusStyles: Record<KnowledgeItem['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const KnowledgePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const loadItem = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await knowledgeApi.getKnowledgeItem(id);
      setItem(data);
    } catch (error) {
      console.error('加载知识条目失败:', error);
      toast.error('加载知识条目失败');
      navigate('/knowledge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item || !confirm('确定要删除该知识条目吗？此操作无法撤销。')) {
      return;
    }

    try {
      setDeleting(true);
      await knowledgeApi.deleteKnowledgeItem(item.id);
      toast.success('知识条目删除成功');
      navigate('/knowledge');
    } catch (error) {
      console.error('删除知识条目失败:', error);
      toast.error('删除知识条目失败');
    } finally {
      setDeleting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!item) return;
    try {
      await knowledgeApi.updateKnowledgeItem(item.id, { is_favorite: !item.is_favorite });
      toast.success(item.is_favorite ? '已取消收藏' : '已加入收藏');
      loadItem();
    } catch (error) {
      console.error('更新收藏状态失败:', error);
      toast.error('更新收藏状态失败');
    }
  };

  const handleUpdated = () => {
    setShowEditForm(false);
    loadItem();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">知识条目不存在</h2>
        <p className="text-gray-600 mb-6">该条目可能已被删除或不存在</p>
        <Link to="/knowledge" className="btn btn-primary">
          返回知识库
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/knowledge"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回知识库</span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={toggleFavorite} className="btn btn-secondary flex items-center gap-2">
            <Star
              size={16}
              className={item.is_favorite ? 'text-yellow-500 fill-yellow-400' : 'text-gray-500'}
            />
            {item.is_favorite ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => setShowEditForm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit size={16} />
            编辑
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-danger flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? '删除中...' : '删除'}
          </button>
        </div>
      </div>

      <article className="card space-y-6">
        <header className="space-y-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusStyles[item.status]}`}>
              {statusText[item.status]}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              <FolderOpen size={12} />
              {item.category || '未分类'}
            </span>
            {item.is_favorite && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded">
                <Star size={12} className="fill-yellow-400" />
                收藏
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
          {item.summary && <p className="text-lg text-gray-600">{item.summary}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              创建于 {format(new Date(item.created_at), 'yyyy年MM月dd日 HH:mm')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              更新于 {format(new Date(item.updated_at), 'yyyy年MM月dd日 HH:mm')}
            </span>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                <LinkIcon size={14} />
                查看来源
              </a>
            )}
          </div>
        </header>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-gray-400" />
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{item.content}</div>
        </div>
      </article>

      {showEditForm && (
        <KnowledgeForm item={item} onClose={() => setShowEditForm(false)} onUpdated={handleUpdated} />
      )}
    </div>
  );
};

export default KnowledgePage;
