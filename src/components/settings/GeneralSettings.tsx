import { useEffect } from 'react';
import { useSettingsStore } from '@/stores';
import { SettingsSection, SettingsItem } from './SettingsLayout';

const themeOptions = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
] as const;

export function GeneralSettings() {
  const { settings, updateGeneral } = useSettingsStore();

  // 应用主题
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.general.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', settings.general.theme === 'dark');
    }
  }, [settings.general.theme]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateGeneral({ theme });
  };

  return (
    <div>
      <SettingsSection title="外观">
        <SettingsItem label="主题" description="选择应用主题">
          <div className="flex gap-2">
            {themeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  settings.general.theme === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingsItem>

        <SettingsItem label="语言" description="界面语言">
          <select
            value={settings.general.language}
            onChange={e => updateGeneral({ language: e.target.value as 'zh-CN' | 'en-US' })}
            className="w-40 h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="启动">
        <SettingsItem label="开机自启" description="系统启动时自动运行">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.autoStart}
              onChange={e => updateGeneral({ autoStart: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </SettingsItem>

        <SettingsItem label="启动最小化" description="启动后最小化到系统托盘">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.startMinimized}
              onChange={e => updateGeneral({ startMinimized: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </SettingsItem>

        <SettingsItem label="关闭行为" description="关闭窗口时的行为">
          <select
            value={settings.general.closeBehavior}
            onChange={e => updateGeneral({ closeBehavior: e.target.value as 'minimize' | 'exit' })}
            className="w-40 h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="minimize">最小化到托盘</option>
            <option value="exit">退出程序</option>
          </select>
        </SettingsItem>
      </SettingsSection>
    </div>
  );
}