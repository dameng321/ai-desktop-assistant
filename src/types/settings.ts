export interface UserSettings {
  general: GeneralSettings;
  model: ModelSettings;
  voice: VoiceSettings;
  avatar: AvatarSettings;
  shortcuts: Record<string, string>;
  privacy: PrivacySettings;
  permissions: PermissionSettings;
}

export interface GeneralSettings {
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'system';
  autoStart: boolean;
  startMinimized: boolean;
  closeBehavior: 'minimize' | 'exit';
}

export interface ModelConfig {
  id: string;
  name: string;
  maxTokens?: number;
}

export interface ModelProvider {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  apiKey: string;
  baseUrl: string;
  models: ModelConfig[];
  customModels?: string[];
}

export interface ModelSettings {
  providers: ModelProvider[];
  activeProviderId: string;
  defaultModelId: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
  contextStrategy: 'recent' | 'smart' | 'full';
  embeddingModel: string;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voiceId: string;
  speed: number;
  pitch: number;
}

export interface AvatarSettings {
  type: 'static' | 'live2d' | 'realistic';
  id: string;
  customUrl?: string;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  dataPath: string;
}

export interface PermissionSettings {
  allowedApps: string[];
  allowedPaths: string[];
  sensitiveConfirm: boolean;
}