
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCustomToast } from '@/hooks/use-toast-custom';
import { NoteCreationForm } from './notes/note-creation-form';
import { NotesList } from './notes/notes-list';

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
  
  const { user } = useAuth();
  const { showError } = useCustomToast();

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
          
          <NoteCreationForm 
            currentTopic={currentTopic}
            contentUrl={contentUrl}
            onNoteCreated={fetchNotes}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <NotesList 
          notes={notes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </CardContent>
    </Card>
  );
};
