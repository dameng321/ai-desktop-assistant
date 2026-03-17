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
    deleteMessage,
    setCurrentConversation,
    deleteConversation,
    updateConversationTitle,
  } = useChatStore();

  const { settings } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const providers = settings.model?.providers || [];
  const activeProviderId = settings.model?.activeProviderId || 'openai';
  const activeProvider = providers.find(p => p.id === activeProviderId);

  useEffect(() => {
    if (activeProvider) {
      aiService.setProvider(new OpenAIProvider({
        providerId: activeProvider.id,
        apiKey: activeProvider.apiKey,
        baseUrl: activeProvider.baseUrl,
        model: settings.model?.defaultModelId || 'gpt-4o',
      }));
    }
  }, [activeProvider, settings.model?.defaultModelId]);

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
        model: settings.model?.defaultModelId || 'gpt-4o',
        temperature: settings.model?.temperature ?? 0.7,
        maxTokens: settings.model?.maxTokens ?? 4096,
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

  // 重新生成最后一条 AI 回复
  const regenerateMessage = useCallback(async () => {
    if (!currentConversationId || isLoading) return;

    const conversation = useChatStore.getState().conversations.find(c => c.id === currentConversationId);
    if (!conversation || conversation.messages.length === 0) return;

    // 找到最后一条助手消息
    const lastAssistantIndex = conversation.messages.findLastIndex(m => m.role === 'assistant');
    if (lastAssistantIndex === -1) return;

    // 找到最后一条用户消息（在助手消息之前）
    const lastUserMessage = conversation.messages.slice(0, lastAssistantIndex).findLast(m => m.role === 'user');
    if (!lastUserMessage) return;

    // 删除最后的助手消息
    const lastAssistantMessage = conversation.messages[lastAssistantIndex];
    deleteMessage(currentConversationId, lastAssistantMessage.id);

    setError(null);
    setIsLoading(true);

    // 创建新的助手消息占位符
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(currentConversationId, assistantMessage);

    try {
      abortControllerRef.current = new AbortController();

      // 获取更新后的对话
      const updatedConversation = useChatStore.getState().conversations.find(c => c.id === currentConversationId);
      
      // 构建消息历史（不包含刚才删除的助手消息）
      const messages = [
        { role: 'system' as const, content: chatSettings.systemPrompt || '你是一个友好的AI助手。' },
        ...(updatedConversation?.messages || []).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      // 流式调用 AI
      let fullContent = '';
      for await (const chunk of aiService.chatStream(messages, {
        model: settings.model?.defaultModelId || 'gpt-4o',
        temperature: settings.model?.temperature ?? 0.7,
        maxTokens: settings.model?.maxTokens ?? 4096,
        signal: abortControllerRef.current.signal,
      })) {
        fullContent += chunk;
        updateMessage(currentConversationId, assistantMessageId, fullContent);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : '重新生成失败';
      setError(errorMessage);
      updateMessage(currentConversationId, assistantMessageId, `抱歉，发生了错误：${errorMessage}`);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentConversationId, isLoading, chatSettings, settings.model, deleteMessage, addMessage, updateMessage]);

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
    regenerateMessage,
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