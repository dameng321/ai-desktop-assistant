import { useChat } from '@/hooks';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';

export function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearError,
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-destructive/80 hover:text-destructive"
          >
            ✕
          </button>
        </div>
      )}

      {/* 消息列表 */}
      <MessageList messages={messages} isStreaming={isLoading} />

      {/* 输入框 */}
      <InputBar
        onSend={sendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
      />
    </div>
  );
}