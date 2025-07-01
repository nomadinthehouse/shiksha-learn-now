
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PenTool, Plus, Search, Tag, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCustomToast } from '@/hooks/use-toast-custom';

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

interface NotesPanelProps {
  currentTopic?: string;
  contentUrl?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ currentTopic, contentUrl }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });
  
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, currentTopic]);

  const fetchNotes = async () => {
    try {
      let query = supabase
        .from('user_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (currentTopic) {
        query = query.eq('topic', currentTopic.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      showError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      showError('Please fill in title and content');
      return;
    }

    try {
      const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user!.id,
          topic: currentTopic?.toLowerCase() || 'general',
          title: newNote.title,
          content: newNote.content,
          content_url: contentUrl,
          tags
        });

      if (error) throw error;
      
      showSuccess('Note created successfully!');
      setNewNote({ title: '', content: '', tags: '' });
      setIsCreateModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      showError('Failed to create note');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Notes
            {currentTopic && (
              <Badge variant="outline" className="ml-2 capitalize">
                {currentTopic}
              </Badge>
            )}
          </CardTitle>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={createNote} className="flex-1">
                    Create Note
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <div key={note.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
