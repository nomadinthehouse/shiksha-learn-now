import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground rounded-t-lg">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Learning Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </CardHeader>
  );
};