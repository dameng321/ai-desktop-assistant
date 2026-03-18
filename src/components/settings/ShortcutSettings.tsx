import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';

const DEFAULT_SHORTCUTS = {
  wakeUp: 'Ctrl+Shift+A',
  voiceInput: 'Ctrl+Shift+V',
  screenshot: 'Ctrl+Shift+S',
  quickAsk: 'Ctrl+Shift+Q',
};

const SHORTCUT_DESCRIPTIONS: Record<string, string> = {
  wakeUp: '显示/隐藏主窗口',
  voiceInput: '开始语音输入',
  screenshot: '截图并识别',
  quickAsk: '快速提问',
};

export function ShortcutSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const shortcuts = settings.shortcuts || DEFAULT_SHORTCUTS;

  const handleKeyChange = (key: string, value: string) => {
    updateSettings({
      shortcuts: {
        ...shortcuts,
        [key]: value,
      },
    });
    setEditingKey(null);
  };

  const handleReset = () => {
    updateSettings({ shortcuts: DEFAULT_SHORTCUTS });
    setResetConfirm(false);
  };

  const formatShortcut = (shortcut: string): string => {
    return shortcut
      .replace(/Ctrl/g, '⌃')
      .replace(/Shift/g, '⇧')
      .replace(/Alt/g, '⌥')
      .replace(/\+/g, ' + ');
  };

  return (
    <>
      <SettingsSection title="快捷键配置" description="自定义全局快捷键（需重启生效）">
        {Object.entries(shortcuts).map(([key, value]) => (
          <SettingsItem
            key={key}
            label={SHORTCUT_DESCRIPTIONS[key] || key}
            description={key}
          >
            {editingKey === key ? (
              <Input
                autoFocus
                className="w-40"
                defaultValue={value}
                onBlur={(e) => handleKeyChange(key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleKeyChange(key, e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setEditingKey(null);
                  }
                }}
                placeholder="按下快捷键..."
              />
            ) : (
              <button
                onClick={() => setEditingKey(key)}
                className="px-3 py-1.5 bg-muted rounded-md text-sm font-mono hover:bg-muted/80 min-w-[100px] text-center"
              >
                {formatShortcut(value)}
              </button>
            )}
          </SettingsItem>
        ))}
      </SettingsSection>

      <SettingsSection title="重置">
        <SettingsItem label="恢复默认快捷键" description="将所有快捷键恢复为默认值">
          {resetConfirm ? (
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleReset}>
                确认
              </Button>
              <Button size="sm" variant="outline" onClick={() => setResetConfirm(false)}>
                取消
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)}>
              重置
            </Button>
          )}
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="说明">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• 快捷键在应用运行时全局生效</p>
          <p>• 点击快捷键可重新设置</p>
          <p>• 唤醒快捷键 (Ctrl+Shift+A) 用于显示/隐藏主窗口</p>
        </div>
      </SettingsSection>
    </>
  );
}