import { Link } from 'react-router-dom';
import { Star, Tag, FolderOpen, Clock, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

import { KnowledgeItem } from '../types';
import { format } from '../utils/date';

interface KnowledgeCardProps {
  item: KnowledgeItem;
}

const statusStyles: Record<KnowledgeItem['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const statusText: Record<KnowledgeItem['status'], string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

const KnowledgeCard = ({ item }: KnowledgeCardProps) => {
  return (
    <Link to={`/knowledge/${item.id}`} className="note-card block">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
            {item.summary ? (
              <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
            ) : (
              <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.is_favorite && <Star size={16} className="text-yellow-500 fill-yellow-400" />}
            <span className={clsx('px-2 py-1 rounded text-xs font-medium', statusStyles[item.status])}>
              {statusText[item.status]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
            <FolderOpen size={12} />
            {item.category || '未分类'}
          </span>
          {item.source_url && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
              <LinkIcon size={12} />
              有来源
            </span>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1">
            <Tag size={13} className="text-gray-400" />
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-xs text-gray-500">+{item.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500 gap-1">
          <Clock size={12} />
          更新于 {format(new Date(item.updated_at), 'MM-dd HH:mm')}
        </div>
      </div>
    </Link>
  );
};

export default KnowledgeCard;
