import { useState, useCallback } from 'react';
import { Button, Input } from '@/components/ui';
import { VoiceInput } from '@/components/voice';

interface InputBarProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({
  onSend,
  onStop,
  isLoading,
  disabled,
  placeholder = '输入消息...',
}: InputBarProps) {
  const [input, setInput] = useState('');

  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  }, [input, isLoading, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleVoiceResult = useCallback((text: string) => {
    if (text.trim()) {
      setInput(prev => prev + (prev ? ' ' : '') + text.trim());
    }
  }, []);

  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2">
        <VoiceInput onResult={handleVoiceResult} disabled={disabled || isLoading} />
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        {isLoading ? (
          <Button onClick={onStop} variant="destructive">
            停止
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!input.trim() || disabled}>
            发送
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}