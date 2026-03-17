import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Conversation, Message, ConversationSettings } from '@/types';
import { generateId } from '@/lib';
import { DEFAULT_TEMPERATURE, MAX_TOKENS, DEFAULT_SYSTEM_PROMPT } from '@/lib';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ConversationSettings;
  
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateSettings: (settings: Partial<ConversationSettings>) => void;
  clearAll: () => void;
}

const defaultSettings: ConversationSettings = {
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: MAX_TOKENS,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      
      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: 'gpt-4-turbo-preview',
          settings: { ...get().settings },
        };
        
        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },
      
      deleteConversation: (id) => {
        set(state => {
          const conversations = state.conversations.filter(c => c.id !== id);
          const currentConversationId = state.currentConversationId === id
            ? conversations[0]?.id || null
            : state.currentConversationId;
          
          return { conversations, currentConversationId };
        });
      },
      
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            const messages = [...c.messages, message];
            const title = c.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
              : c.title;
            
            return {
              ...c,
              messages,
              title,
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      updateMessage: (conversationId, messageId, content) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      deleteMessage: (conversationId, messageId) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            return {
              ...c,
              messages: c.messages.filter(m => m.id !== messageId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      updateSettings: (settings) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      clearAll: () => {
        set({
          conversations: [],
          currentConversationId: null,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);