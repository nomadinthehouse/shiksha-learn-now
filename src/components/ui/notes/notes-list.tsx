
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, PenTool } from 'lucide-react';
import { NoteItem } from './note-item';

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

interface NotesListProps {
  notes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  searchQuery, 
  onSearchChange 
}) => {
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <PenTool className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};
