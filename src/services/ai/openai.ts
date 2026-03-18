import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { generateId } from '@/lib';
import type { ChatMessage, ChatOptions, AIProvider } from './types';

export class OpenAIProvider implements AIProvider {
  private providerId: string;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: { providerId: string; apiKey: string; baseUrl?: string; model?: string }) {
    this.providerId = config.providerId || 'openai';
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4o';
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const result = await this.chatStream(messages, options);
    const chunks: string[] = [];
    for await (const chunk of result) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }

  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const requestId = generateId();
    
    const channel = await listen<string>(`chat-chunk-${requestId}`, () => {
      // Event received
    });

    const errorChannel = await listen<string>(`chat-error-${requestId}`, (event) => {
      throw new Error(event.payload);
    });

    const doneChannel = await listen<void>(`chat-done-${requestId}`, () => {
      // Stream done
    });

    const queue: string[] = [];
    let done = false;
    let error: string | null = null;

    const chunkUnlisten = await listen<string>(`chat-chunk-${requestId}`, (event) => {
      queue.push(event.payload);
    });

    const errorUnlisten = await listen<string>(`chat-error-${requestId}`, (event) => {
      error = event.payload;
      done = true;
    });

    const doneUnlisten = await listen<void>(`chat-done-${requestId}`, () => {
      done = true;
    });

    // Start the stream
    invoke('chat_stream', {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      providerId: this.providerId,
      model: options?.model || this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 4096,
      requestId,
    }).catch((err) => {
      error = err;
      done = true;
    });

    try {
      while (!done || queue.length > 0) {
        if (error) {
          throw new Error(error);
        }
        
        if (queue.length > 0) {
          yield queue.shift()!;
        } else if (!done) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    } finally {
      chunkUnlisten();
      errorUnlisten();
      doneUnlisten();
      channel();
      errorChannel();
      doneChannel();
    }
  }
}