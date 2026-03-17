import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore, useSettingsStore } from '@/stores';
import { aiService, OpenAIProvider } from '@/services/ai';
import type { Message } from '@/types';
import { generateId } from '@/lib';

export function useChat() {
  const {
    conversations,
    currentConversationId,
    settings: chatSettings,
    createConversation,
    addMessage,
    updateMessage,
    setCurrentConversation,
    deleteConversation,
    updateConversationTitle,
  } = useChatStore();

  const { settings } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const activeProvider = settings.model.providers.find(p => p.id === settings.model.activeProviderId);

  useEffect(() => {
    if (activeProvider) {
      aiService.setProvider(new OpenAIProvider({
        providerId: activeProvider.id,
        apiKey: activeProvider.apiKey,
        baseUrl: activeProvider.baseUrl,
        model: settings.model.defaultModelId,
      }));
    }
  }, [activeProvider, settings.model.defaultModelId]);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    let conversationId = currentConversationId;

    // 如果没有当前对话，创建新的
    if (!conversationId) {
      conversationId = createConversation();
    }

    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    addMessage(conversationId, userMessage);

    // 创建助手消息占位符
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(conversationId, assistantMessage);

    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      // 构建消息历史
      const conversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
      const messages = [
        { role: 'system' as const, content: chatSettings.systemPrompt || '你是一个友好的AI助手。' },
        ...(conversation?.messages || []).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: content.trim() },
      ];

      // 流式调用 AI
      let fullContent = '';
      for await (const chunk of aiService.chatStream(messages, {
        model: settings.model.defaultModelId,
        temperature: settings.model.temperature,
        maxTokens: settings.model.maxTokens,
        signal: abortControllerRef.current.signal,
      })) {
        fullContent += chunk;
        updateMessage(conversationId, assistantMessageId, fullContent);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // 用户主动取消，不视为错误
        return;
      }

      const errorMessage = err instanceof Error ? err.message : '发送消息失败';
      setError(errorMessage);
      
      // 更新助手消息为错误信息
      updateMessage(conversationId, assistantMessageId, `抱歉，发生了错误：${errorMessage}`);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentConversationId, isLoading, chatSettings, settings.model, createConversation, addMessage, updateMessage]);

  // 停止生成
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 新建对话
  const newConversation = useCallback(() => {
    const id = createConversation();
    setCurrentConversation(id);
    setError(null);
  }, [createConversation, setCurrentConversation]);

  return {
    // 状态
    conversation: currentConversation,
    messages: currentConversation?.messages || [],
    isLoading,
    error,
    
    // 操作
    sendMessage,
    stopGeneration,
    clearError,
    newConversation,
    
    // 对话管理
    conversations,
    currentConversationId,
    setCurrentConversation,
    deleteConversation,
    updateConversationTitle,
  };
}