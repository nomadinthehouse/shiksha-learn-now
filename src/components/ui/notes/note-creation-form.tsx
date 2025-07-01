
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCustomToast } from '@/hooks/use-toast-custom';

interface NoteCreationFormProps {
  currentTopic?: string;
  contentUrl?: string;
  onNoteCreated: () => void;
}

export const NoteCreationForm: React.FC<NoteCreationFormProps> = ({ 
  currentTopic, 
  contentUrl, 
  onNoteCreated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });
  
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();

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
      setIsOpen(false);
      onNoteCreated();
    } catch (error) {
      console.error('Error creating note:', error);
      showError('Failed to create note');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
