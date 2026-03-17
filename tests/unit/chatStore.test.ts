import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '@/stores/chatStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('chatStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useChatStore.setState({
      conversations: [],
      currentConversationId: null,
      settings: {
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: '你是一个友好的AI助手。',
      },
    });
    localStorageMock.clear();
  });

  describe('createConversation', () => {
    it('应该创建新对话并返回 ID', () => {
      const { createConversation } = useChatStore.getState();
      
      const id = createConversation();
      
      expect(id).toBeDefined();
      expect(useChatStore.getState().conversations).toHaveLength(1);
      expect(useChatStore.getState().currentConversationId).toBe(id);
    });

    it('新对话应该有默认标题', () => {
      const { createConversation } = useChatStore.getState();
      
      createConversation();
      
      const conversation = useChatStore.getState().conversations[0];
      expect(conversation.title).toBe('新对话');
    });
  });

  describe('addMessage', () => {
    it('应该添加消息到指定对话', () => {
      const { createConversation, addMessage } = useChatStore.getState();
      
      const convId = createConversation();
      addMessage(convId, {
        id: 'msg-1',
        role: 'user',
        content: '你好',
        timestamp: Date.now(),
      });
      
      const conversation = useChatStore.getState().conversations.find(c => c.id === convId);
      expect(conversation?.messages).toHaveLength(1);
      expect(conversation?.messages[0].content).toBe('你好');
    });

    it('首条用户消息应该更新对话标题', () => {
      const { createConversation, addMessage } = useChatStore.getState();
      
      const convId = createConversation();
      addMessage(convId, {
        id: 'msg-1',
        role: 'user',
        content: '这是一个很长的测试消息用来验证标题截断功能是否正常工作',
        timestamp: Date.now(),
      });
      
      const conversation = useChatStore.getState().conversations.find(c => c.id === convId);
      expect(conversation?.title).toContain('这是一个很长的测试消息');
      expect(conversation?.title.length).toBeLessThanOrEqual(33); // 30 + '...'
    });
  });

  describe('deleteConversation', () => {
    it('应该删除指定对话', () => {
      const { createConversation, deleteConversation } = useChatStore.getState();
      
      const id1 = createConversation();
      const id2 = createConversation();
      
      expect(useChatStore.getState().conversations).toHaveLength(2);
      
      deleteConversation(id1);
      
      expect(useChatStore.getState().conversations).toHaveLength(1);
      expect(useChatStore.getState().conversations[0].id).toBe(id2);
    });

    it('删除当前对话时应切换到其他对话', () => {
      const { createConversation, deleteConversation, setCurrentConversation } = useChatStore.getState();
      
      const id1 = createConversation();
      const id2 = createConversation();
      
      setCurrentConversation(id1);
      deleteConversation(id1);
      
      expect(useChatStore.getState().currentConversationId).toBe(id2);
    });
  });

  describe('updateMessage', () => {
    it('应该更新指定消息的内容', () => {
      const { createConversation, addMessage, updateMessage } = useChatStore.getState();
      
      const convId = createConversation();
      addMessage(convId, {
        id: 'msg-1',
        role: 'assistant',
        content: '原始内容',
        timestamp: Date.now(),
      });
      
      updateMessage(convId, 'msg-1', '更新后的内容');
      
      const conversation = useChatStore.getState().conversations.find(c => c.id === convId);
      expect(conversation?.messages[0].content).toBe('更新后的内容');
    });
  });

  describe('updateSettings', () => {
    it('应该更新设置', () => {
      const { updateSettings } = useChatStore.getState();
      
      updateSettings({ temperature: 0.9 });
      
      expect(useChatStore.getState().settings.temperature).toBe(0.9);
    });
  });

  describe('clearAll', () => {
    it('应该清除所有对话', () => {
      const { createConversation, clearAll } = useChatStore.getState();
      
      createConversation();
      createConversation();
      createConversation();
      
      expect(useChatStore.getState().conversations).toHaveLength(3);
      
      clearAll();
      
      expect(useChatStore.getState().conversations).toHaveLength(0);
      expect(useChatStore.getState().currentConversationId).toBeNull();
    });
  });
});