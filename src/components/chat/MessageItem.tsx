import { useState } from 'react';
import { cn } from '@/lib';
import { MarkdownRenderer } from '@/components/common';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}

export function MessageItem({ message, isStreaming, isLastAssistant, onRegenerate }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl group relative',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {/* 操作按钮 */}
        {!isStreaming && message.content && (
          <div className={cn(
            "absolute -right-2 -top-2 flex gap-1",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            {/* 重新生成按钮 */}
            {!isUser && isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-full bg-background border shadow-sm hover:bg-accent text-muted-foreground hover:text-foreground"
                title="重新生成"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full bg-background border shadow-sm hover:bg-accent text-muted-foreground hover:text-foreground"
              title="复制"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* 消息内容 */}
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* 流式输出光标 */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}