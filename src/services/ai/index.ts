import type { ChatMessage, ChatOptions, AIProvider } from './types';
import { OpenAIProvider } from './openai';

export * from './types';
export { OpenAIProvider };

class AIService implements AIProvider {
  private provider: AIProvider | null = null;

  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  private ensureProvider(): AIProvider {
    if (!this.provider) {
      throw new Error('AI 提供者未配置，请先调用 setProvider');
    }
    return this.provider;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    return this.ensureProvider().chat(messages, options);
  }

  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    yield* this.ensureProvider().chatStream(messages, options);
  }
}

export const aiService = new AIService();