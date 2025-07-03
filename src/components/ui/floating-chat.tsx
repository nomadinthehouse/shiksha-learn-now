
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomToast } from '@/hooks/use-toast-custom';
import { useAuth } from '@/components/auth/AuthContext';
import { ChatHeader } from './chat/chat-header';
import { ChatMessage } from './chat/chat-message';
import { ChatInput } from './chat/chat-input';
import { LoadingIndicator } from './chat/loading-indicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatProps {
  searchContext?: string;
  onAuthRequired: () => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ searchContext, onAuthRequired }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useCustomToast();
  const { user } = useAuth();


  const validateInput = (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;
    if (input.length > 1000) return false; // Limit message length
    if (input.trim().length === 0) return false;
    
    // Check for potentially malicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(input));
  };

  const sendMessage = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const trimmedMessage = currentMessage.trim();
    
    if (!validateInput(trimmedMessage)) {
      showError('Invalid message content. Please try again.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: trimmedMessage,
          context: searchContext || ''
        }
      });

      if (error) throw error;

      if (!data?.response || typeof data.response !== 'string') {
        throw new Error('Invalid response format');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      showError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputFocus = () => {
    if (!user) {
      onAuthRequired();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 h-80 shadow-2xl bg-background border">
          <ChatHeader onClose={() => setIsOpen(false)} />
          <CardContent className="flex flex-col h-full p-3">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-48">
              {messages.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Ask me anything about your learning topic!
                  {searchContext && ` I can help with ${searchContext}.`}
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
            <ChatInput
              value={currentMessage}
              onChange={setCurrentMessage}
              onSend={sendMessage}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              disabled={isLoading || !user}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
