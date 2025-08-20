import { Link } from 'react-router-dom';
import { format } from '../utils/date';
import { Clock, Tag } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Link to={`/notes/${note.id}`} className="note-card block">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {note.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
            {truncateContent(note.content)}
          </p>
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center space-x-1 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>
            {format(new Date(note.updated_at), 'MM-dd HH:mm')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;