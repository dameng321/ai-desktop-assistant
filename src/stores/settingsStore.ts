import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings, ModelProvider } from '@/types';
import { getDefaultProviders } from '@/lib/providers';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateGeneral: (general: Partial<UserSettings['general']>) => void;
  updateModel: (model: Partial<UserSettings['model']>) => void;
  updateProvider: (providerId: string, updates: Partial<ModelProvider>) => void;
  addCustomProvider: (provider: ModelProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
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
    providers: getDefaultProviders(),
    activeProviderId: 'openai',
    defaultModelId: 'gpt-4o',
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
      
      updateProvider: (providerId, updates) => {
        set(state => ({
          settings: {
            ...state.settings,
            model: {
              ...state.settings.model,
              providers: state.settings.model.providers.map(p =>
                p.id === providerId ? { ...p, ...updates } : p
              ),
            },
          },
        }));
      },
      
      addCustomProvider: (provider) => {
        set(state => ({
          settings: {
            ...state.settings,
            model: {
              ...state.settings.model,
              providers: [...state.settings.model.providers, provider],
            },
          },
        }));
      },
      
      removeProvider: (providerId) => {
        set(state => {
          const providers = state.settings.model.providers.filter(p => p.id !== providerId);
          const activeProviderId = state.settings.model.activeProviderId === providerId
            ? providers[0]?.id || 'openai'
            : state.settings.model.activeProviderId;
          
          return {
            settings: {
              ...state.settings,
              model: {
                ...state.settings.model,
                providers,
                activeProviderId,
              },
            },
          };
        });
      },
      
      setActiveProvider: (providerId) => {
        set(state => ({
          settings: {
            ...state.settings,
            model: {
              ...state.settings.model,
              activeProviderId: providerId,
            },
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
      partialize: (state) => ({
        settings: {
          ...state.settings,
          model: {
            ...state.settings.model,
            providers: state.settings.model.providers.map(p => ({
              ...p,
              apiKey: p.apiKey,
            })),
          },
        },
      }),
    }
  )
);