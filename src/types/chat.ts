export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  knowledgeBaseId?: string;
}