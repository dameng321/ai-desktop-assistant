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

export interface ModelSettings {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
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