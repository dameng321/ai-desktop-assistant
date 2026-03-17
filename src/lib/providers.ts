import type { ModelProvider } from '@/types/settings';

export const PRESET_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16384 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxTokens: 200000 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000 },
    ],
  },
  {
    id: 'google',
    name: 'Google AI',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxTokens: 1048576 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 2097152 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 1048576 },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', maxTokens: 1048576 },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', maxTokens: 64000 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', maxTokens: 16000 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', maxTokens: 64000 },
    ],
  },
  {
    id: 'moonshot',
    name: 'Moonshot (月之暗面)',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', maxTokens: 8192 },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', maxTokens: 32768 },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', maxTokens: 131072 },
    ],
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', maxTokens: 128000 },
      { id: 'glm-4-0520', name: 'GLM-4 0520', maxTokens: 128000 },
      { id: 'glm-4-air', name: 'GLM-4 Air', maxTokens: 128000 },
      { id: 'glm-4-airx', name: 'GLM-4 AirX', maxTokens: 8192 },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', maxTokens: 128000 },
    ],
  },
  {
    id: 'qwen',
    name: '通义千问 (阿里云)',
    type: 'preset',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', maxTokens: 32768 },
      { id: 'qwen-plus', name: 'Qwen Plus', maxTokens: 131072 },
      { id: 'qwen-turbo', name: 'Qwen Turbo', maxTokens: 131072 },
      { id: 'qwen-long', name: 'Qwen Long', maxTokens: 1000000 },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    type: 'preset',
    apiKey: '',
    baseUrl: 'http://localhost:11434/v1',
    models: [],
    customModels: [],
  },
];

export function getDefaultProviders(): ModelProvider[] {
  return PRESET_PROVIDERS.map(p => ({ ...p }));
}

export function createCustomProvider(name: string, baseUrl: string): ModelProvider {
  return {
    id: `custom-${Date.now()}`,
    name,
    type: 'custom',
    apiKey: '',
    baseUrl,
    models: [],
    customModels: [],
  };
}