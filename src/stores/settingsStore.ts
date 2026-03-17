import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings } from '@/types';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateGeneral: (general: Partial<UserSettings['general']>) => void;
  updateModel: (model: Partial<UserSettings['model']>) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  general: {
    language: 'zh-CN',
    theme: 'system',
    autoStart: true,
    startMinimized: true,
    closeBehavior: 'minimize',
  },
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4096,
  },
  voice: {
    enabled: true,
    language: 'zh-CN',
    voiceId: 'zh-CN-XiaoxiaoNeural',
    speed: 1.0,
    pitch: 1.0,
  },
  avatar: {
    type: 'static',
    id: 'default',
  },
  shortcuts: {
    wakeUp: 'Ctrl+Shift+A',
    voiceInput: 'Ctrl+Shift+V',
    screenshot: 'Ctrl+Shift+S',
    quickAsk: 'Ctrl+Shift+Q',
  },
  privacy: {
    analyticsEnabled: false,
    dataPath: '',
  },
  permissions: {
    allowedApps: [],
    allowedPaths: [],
    sensitiveConfirm: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      updateGeneral: (general) => {
        set(state => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...general },
          },
        }));
      },
      
      updateModel: (model) => {
        set(state => ({
          settings: {
            ...state.settings,
            model: { ...state.settings.model, ...model },
          },
        }));
      },
      
      reset: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);