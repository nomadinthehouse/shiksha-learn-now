
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PenTool, Plus, Search, Tag, ExternalLink, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCustomToast } from '@/hooks/use-toast-custom';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface EnhancedNotesPanelProps {
  currentTopic?: string;
  contentUrl?: string;
}

export const EnhancedNotesPanel: React.FC<EnhancedNotesPanelProps> = ({ 
  currentTopic, 
  contentUrl 
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });
  
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, currentTopic]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, selectedTag]);

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

  const filterNotes = () => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
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
      setIsCreating(false);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      showError('Failed to create note');
    }
  };

  const updateNote = async (note: Note) => {
    if (!note.title.trim() || !note.content.trim()) {
      showError('Please fill in title and content');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_notes')
        .update({
          title: note.title,
          content: note.content,
          tags: note.tags
        })
        .eq('id', note.id);

      if (error) throw error;
      
      showSuccess('Note updated successfully!');
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      showError('Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      showSuccess('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showError('Failed to delete note');
    }
  };

  const getAllTags = () => {
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NoteForm = ({ note, onSave, onCancel }: { 
    note?: Note, 
    onSave: (note: any) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      title: note?.title || '',
      content: note?.content || '',
      tags: note?.tags.join(', ') || ''
    });

    const handleSave = () => {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      onSave({
        ...note,
        title: formData.title,
        content: formData.content,
        tags
      });
    };

    return (
      <div className="space-y-4">
        <Input
          placeholder="Note title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
        <Textarea
          placeholder="Write your note here..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={6}
          className="min-h-32"
        />
        <Input
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            {note ? 'Update Note' : 'Create Note'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const NoteCard = ({ note }: { note: Note }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-1 flex-1">{note.title}</h4>
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingNote(note)}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteNote(note.id)}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{note.content}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{formatDate(note.updated_at)}</span>
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
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const NotesContent = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {getAllTags().length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedTag === '' ? 'default' : 'outline'}
              onClick={() => setSelectedTag('')}
              className="h-7 text-xs"
            >
              All Tags
            </Button>
            {getAllTags().map((tag) => (
              <Button
                key={tag}
                size="sm"
                variant={selectedTag === tag ? 'default' : 'outline'}
                onClick={() => setSelectedTag(tag)}
                className="h-7 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <PenTool className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );

  const CreateButton = () => {
    const ButtonComponent = isMobile ? SheetTrigger : DialogTrigger;
    return (
      <ButtonComponent asChild>
        <Button size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </ButtonComponent>
    );
  };

  const CreateDialog = () => {
    const DialogComponent = isMobile ? SheetContent : DialogContent;
    const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
    const TitleComponent = isMobile ? SheetTitle : DialogTitle;
    
    return (
      <DialogComponent>
        <HeaderComponent>
          <TitleComponent>Create New Note</TitleComponent>
        </HeaderComponent>
        <NoteForm 
          onSave={(note) => {
            setNewNote(note);
            createNote();
          }}
          onCancel={() => setIsCreating(false)}
        />
      </DialogComponent>
    );
  };

  const EditDialog = () => {
    if (!editingNote) return null;
    
    const DialogComponent = isMobile ? Sheet : Dialog;
    const DialogContentComponent = isMobile ? SheetContent : DialogContent;
    const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
    const TitleComponent = isMobile ? SheetTitle : DialogTitle;
    
    return (
      <DialogComponent open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContentComponent>
          <HeaderComponent>
            <TitleComponent>Edit Note</TitleComponent>
          </HeaderComponent>
          <NoteForm 
            note={editingNote}
            onSave={updateNote}
            onCancel={() => setEditingNote(null)}
          />
        </DialogContentComponent>
      </DialogComponent>
    );
  };

  const Container = isMobile ? Sheet : Dialog;

  return (
    <>
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
            
            <Container open={isCreating} onOpenChange={setIsCreating}>
              <CreateButton />
              <CreateDialog />
            </Container>
          </div>
        </CardHeader>
        
        <CardContent>
          <NotesContent />
        </CardContent>
      </Card>
      
      <EditDialog />
    </>
  );
};
