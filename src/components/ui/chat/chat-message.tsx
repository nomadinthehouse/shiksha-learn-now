import React from 'react';
import { User, Bot } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

const sanitizeAndFormatText = (text: string) => {
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: ['strong', 'em', 'br', 'p'],
    ALLOWED_ATTR: []
  });
  
  return sanitized
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/#{1,6}\s*(.*?)(\n|$)/g, '<strong>$1</strong><br>')
    .replace(/^\d+\.\s+/gm, '• ');
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.isUser ? 'bg-primary' : 'bg-muted'
      }`}>
        {message.isUser ? (
          <User className="h-3 w-3 text-primary-foreground" />
        ) : (
          <Bot className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
      <div
        className={`max-w-[75%] p-2 rounded-lg text-xs leading-relaxed ${
          message.isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-muted-foreground rounded-bl-none'
        }`}
      >
        {message.isUser ? (
          message.text
        ) : (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: sanitizeAndFormatText(message.text) 
            }} 
          />
        )}
      </div>
    </div>
  );
};