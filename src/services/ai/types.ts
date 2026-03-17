export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export enum AIProviderType {
  OpenAI = 'openai',
  Ollama = 'ollama',
  Custom = 'custom',
}