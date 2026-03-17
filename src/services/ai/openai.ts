import type { ChatMessage, ChatOptions, AIProvider, AIProviderConfig } from './types';

export class OpenAIProvider implements AIProvider {
  private providerId: string;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.providerId = config.providerId || 'openai';
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4o';
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.providerId === 'google') {
      headers['x-goog-api-key'] = this.apiKey;
    } else if (this.providerId === 'anthropic') {
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private getEndpoint(): string {
    if (this.providerId === 'google') {
      return `${this.baseUrl}/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
    }
    if (this.providerId === 'anthropic') {
      return `${this.baseUrl}/messages`;
    }
    return `${this.baseUrl}/chat/completions`;
  }

  private formatMessagesForGoogle(messages: ChatMessage[]): { contents: Array<{ role: string; parts: Array<{ text: string }> }>; systemInstruction?: { parts: Array<{ text: string }> } } {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    let systemInstruction: { parts: Array<{ text: string }> } | undefined;
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    
    return { contents, systemInstruction };
  }

  private formatMessagesForAnthropic(messages: ChatMessage[]): { system: string; messages: Array<{ role: string; content: string }> } {
    let systemPrompt = '';
    const formatted: Array<{ role: string; content: string }> = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        formatted.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }
    
    return { system: systemPrompt, messages: formatted };
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = options?.model || this.model;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 4096;

    let endpoint: string;
    let body: object;

    if (this.providerId === 'google') {
      endpoint = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
      const { contents, systemInstruction } = this.formatMessagesForGoogle(messages);
      body = {
        contents,
        systemInstruction,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };
    } else if (this.providerId === 'anthropic') {
      endpoint = `${this.baseUrl}/messages`;
      const { system, messages: formattedMessages } = this.formatMessagesForAnthropic(messages);
      body = {
        model,
        max_tokens: maxTokens,
        system,
        messages: formattedMessages,
      };
    } else {
      endpoint = `${this.baseUrl}/chat/completions`;
      body = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (this.providerId === 'google') {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    if (this.providerId === 'anthropic') {
      return data.content?.[0]?.text || '';
    }
    return data.choices[0]?.message?.content || '';
  }

  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const model = options?.model || this.model;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 4096;

    let endpoint: string;
    let body: object;

    if (this.providerId === 'google') {
      endpoint = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
      body = {
        contents: this.formatMessagesForGoogle(messages).contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };
    } else if (this.providerId === 'anthropic') {
      endpoint = `${this.baseUrl}/messages`;
      const { system, messages: formattedMessages } = this.formatMessagesForAnthropic(messages);
      body = {
        model,
        max_tokens: maxTokens,
        system,
        messages: formattedMessages,
        stream: true,
      };
    } else {
      endpoint = `${this.baseUrl}/chat/completions`;
      body = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (this.providerId === 'google') {
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
              } catch {
                // 忽略解析错误
              }
            }
          } else if (this.providerId === 'anthropic') {
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                if (json.type === 'content_block_delta') {
                  const text = json.delta?.text;
                  if (text) yield text;
                }
              } catch {
                // 忽略解析错误
              }
            }
          } else {
            if (trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}