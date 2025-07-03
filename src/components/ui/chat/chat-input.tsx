import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  disabled: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFocus,
  disabled,
  placeholder = "Ask me anything..."
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 1000) {
      onChange(inputValue);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyPress={onKeyPress}
        onFocus={onFocus}
        disabled={disabled}
        className="flex-1 text-xs h-8"
        maxLength={1000}
      />
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Send className="h-3 w-3" />
      </Button>
    </div>
  );
};