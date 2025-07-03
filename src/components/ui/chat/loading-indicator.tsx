import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <Bot className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="bg-muted text-muted-foreground p-2 rounded-lg rounded-bl-none text-xs">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};