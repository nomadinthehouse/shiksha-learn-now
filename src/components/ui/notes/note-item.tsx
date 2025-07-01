
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, ExternalLink } from 'lucide-react';

interface Note {
  id: string;
  topic: string;
  title: string;
  content: string;
  content_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface NoteItemProps {
  note: Note;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
        <span className="text-xs text-gray-500">{formatDate(note.updated_at)}</span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{note.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Tag className="h-2 w-2 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        {note.content_url && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(note.content_url, '_blank')}
            className="h-6 px-2"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
