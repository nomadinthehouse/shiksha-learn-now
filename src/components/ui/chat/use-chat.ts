import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomToast } from '@/hooks/use-toast-custom';
import { useAuth } from '@/components/auth/AuthContext';
import { validateInput } from './validation';
import { Message } from './types';

export const useChat = (searchContext?: string, onAuthRequired?: () => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useCustomToast();
  const { user } = useAuth();

  const sendMessage = async () => {
    if (!user) {
      onAuthRequired?.();
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
      onAuthRequired?.();
    }
  };

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    isLoading,
    sendMessage,
    handleKeyPress,
    handleInputFocus,
    user
  };
};