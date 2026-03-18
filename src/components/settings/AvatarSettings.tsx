import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { Avatar } from '@/components/avatar';

export function AvatarSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [customUrl, setCustomUrl] = useState(settings.avatar?.customUrl || '');
  
  const avatar = settings.avatar || {
    type: 'static' as const,
    id: 'robot',
  };

  const currentPreset = AVATAR_PRESETS.find(p => p.id === avatar.id);
  const currentEmoji = currentPreset?.emoji || '🤖';

  const handleSelectPreset = (presetId: string) => {
    updateSettings({
      avatar: { ...avatar, id: presetId, type: 'static', customUrl: undefined }
    });
  };

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      updateSettings({
        avatar: { ...avatar, type: 'static', id: 'custom', customUrl: customUrl.trim() }
      });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection title="当前形象" description="AI 助手的显示形象">
        <div className="flex items-center gap-4 py-4">
          <Avatar emoji={currentEmoji} size="xl" />
          <div>
            <h3 className="text-lg font-medium">{currentPreset?.name || '自定义'}</h3>
            <p className="text-sm text-muted-foreground">
              {currentPreset?.description || '使用自定义头像'}
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="预设形象" description="选择一个预设的 AI 形象">
        <div className="grid grid-cols-4 gap-3 py-2">
          {AVATAR_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 transition-all
                ${avatar.id === preset.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'}
              `}
            >
              <Avatar emoji={preset.emoji} size="md" />
              <span className="text-xs mt-2 font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="自定义头像" description="使用网络图片作为头像">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              placeholder="输入图片 URL..."
              className="flex-1"
            />
            <Button onClick={handleCustomUrl} disabled={!customUrl.trim()}>
              应用
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持直接链接的图片 URL（如 .png, .jpg, .gif）
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="形象类型" description="选择形象的显示方式">
        <SettingsItem label="静态头像" description="使用 emoji 或图片作为头像">
          <button
            onClick={() => updateSettings({ avatar: { ...avatar, type: 'static' } })}
            className={`w-12 h-6 rounded-full transition-colors ${
              avatar.type === 'static' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              avatar.type === 'static' ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </SettingsItem>
        
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            💡 Live2D 支持即将推出，敬请期待！
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}