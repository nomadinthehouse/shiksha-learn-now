
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { ChatHeader } from './chat/chat-header';
import { ChatMessage } from './chat/chat-message';
import { ChatInput } from './chat/chat-input';
import { LoadingIndicator } from './chat/loading-indicator';
import { useChat } from './chat/use-chat';
import { FloatingChatProps } from './chat/types';

export const FloatingChat: React.FC<FloatingChatProps> = ({ searchContext, onAuthRequired }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages,
    currentMessage,
    setCurrentMessage,
    isLoading,
    sendMessage,
    handleKeyPress,
    handleInputFocus,
    user
  } = useChat(searchContext, onAuthRequired);

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
