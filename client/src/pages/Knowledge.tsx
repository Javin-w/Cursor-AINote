import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Library, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import { KnowledgeItem, KnowledgeStats } from '../types';
import { knowledgeApi } from '../services/api';
import KnowledgeCard from '../components/KnowledgeCard';
import KnowledgeForm from '../components/KnowledgeForm';

const Knowledge = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const data = await knowledgeApi.getKnowledgeItems({
        keyword: keyword.trim() || undefined,
        category: category || undefined,
        status: (status as 'draft' | 'published' | 'archived') || undefined,
        favorite: favoriteOnly ? true : undefined,
      });
      setItems(data);
    } catch (error) {
      console.error('加载知识条目失败:', error);
      toast.error('加载知识条目失败');
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [statsData, categoriesData] = await Promise.all([
        knowledgeApi.getKnowledgeStats(),
        knowledgeApi.getCategories(),
      ]);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('加载知识库统计失败:', error);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, [keyword, category, status, favoriteOnly]);

  useEffect(() => {
    loadMeta();
  }, []);

  const handleCreated = () => {
    setShowForm(false);
    loadKnowledge();
    loadMeta();
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人知识库</h1>
          <p className="text-gray-600">沉淀知识、分类整理、快速检索</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          新建知识条目
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">总条目</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.draft}</div>
            <div className="text-sm text-gray-600">草稿</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">已发布</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.archived}</div>
            <div className="text-sm text-gray-600">归档</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.favorite}</div>
            <div className="text-sm text-gray-600">收藏</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.categories}</div>
            <div className="text-sm text-gray-600">分类数</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">筛选知识库</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="input pl-10"
                placeholder="搜索标题、摘要或正文..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="">全部分类</option>
              {categories.map((itemCategory) => (
                <option key={itemCategory} value={itemCategory}>
                  {itemCategory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>

        <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={favoriteOnly}
            onChange={(e) => setFavoriteOnly(e.target.checked)}
          />
          <Star size={14} className="text-yellow-500" />
          仅看收藏
        </label>
      </div>

      {items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Library size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无符合条件的知识条目</h3>
          <p className="text-gray-600 mb-6">尝试放宽筛选条件，或创建你的第一条知识沉淀</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            创建知识条目
          </button>
        </div>
      )}

      {showForm && (
        <KnowledgeForm onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default Knowledge;
