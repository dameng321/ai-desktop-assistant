import { useState, useEffect, useCallback } from 'react';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit } from '@tauri-apps/api/event';
import { Button, useToast } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';
import { AVATAR_PRESETS } from '@/lib/avatars';

type PetSize = 'small' | 'medium' | 'large';

const PET_SIZES: { id: PetSize; label: string }[] = [
  { id: 'small', label: '小' },
  { id: 'medium', label: '中' },
  { id: 'large', label: '大' },
];

export function PetSettings() {
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettingsStore();
  const [isPetVisible, setIsPetVisible] = useState(false);

  const petEnabled = settings.pet?.enabled ?? false;
  const petSize = settings.pet?.size ?? 'medium';
  const petAvatarId = settings.pet?.avatarId ?? settings.avatar?.id ?? 'robot';

  const notifyPetWindow = useCallback(async () => {
    try {
      await emit('settings-changed', {});
    } catch (e) {
      console.error('通知桌宠窗口失败:', e);
    }
  }, []);

  const checkPetWindow = useCallback(async () => {
    try {
      const petWindow = await WebviewWindow.getByLabel('pet');
      if (petWindow) {
        const visible = await petWindow.isVisible();
        setIsPetVisible(visible);
      }
    } catch (e) {
      console.error('检查桌宠窗口失败:', e);
    }
  }, []);

  useEffect(() => {
    checkPetWindow();
  }, [checkPetWindow]);

  const togglePet = useCallback(async () => {
    try {
      let petWindow = await WebviewWindow.getByLabel('pet');
      
      if (!petWindow) {
        petWindow = new WebviewWindow('pet', {
          url: '/pet',
          decorations: false,
          transparent: true,
          alwaysOnTop: true,
          skipTaskbar: true,
          width: 300,
          height: 300,
        });
        await petWindow.show();
        setIsPetVisible(true);
        showToast('桌宠已开启', 'success');
      } else {
        const visible = await petWindow.isVisible();
        if (visible) {
          await petWindow.hide();
          setIsPetVisible(false);
          showToast('桌宠已关闭', 'info');
        } else {
          await petWindow.show();
          setIsPetVisible(true);
          showToast('桌宠已开启', 'success');
        }
      }
    } catch (e) {
      console.error('切换桌宠失败:', e);
      const message = e instanceof Error ? e.message : String(e);
      showToast(`操作失败: ${message}`, 'error');
    }
  }, [showToast]);

  const handleSizeChange = async (size: PetSize) => {
    updateSettings({ pet: { ...settings.pet, size } });
    await notifyPetWindow();
  };

  const handleAvatarChange = async (avatarId: string) => {
    updateSettings({ pet: { ...settings.pet, avatarId } });
    await notifyPetWindow();
  };

  return (
    <div className="space-y-6">
      <SettingsSection title="桌宠模式" description="在桌面上显示可爱的 AI 助手">
        <SettingsItem label="启用桌宠" description="开启后会在桌面显示一个可拖动的 AI 助手">
          <button
            onClick={() => {
              updateSettings({ pet: { ...settings.pet, enabled: !petEnabled } });
              if (!petEnabled) {
                togglePet();
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors ${
              petEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              petEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </SettingsItem>

        <div className="pt-2 space-y-2">
          <Button 
            onClick={togglePet}
            variant={isPetVisible ? 'destructive' : 'default'}
            className="w-full"
          >
            {isPetVisible ? '隐藏桌宠' : '显示桌宠'}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="桌宠大小" description="调整桌宠显示尺寸">
        <div className="flex gap-2">
          {PET_SIZES.map(size => (
            <button
              key={size.id}
              onClick={() => handleSizeChange(size.id)}
              className={`flex-1 py-2 px-3 rounded-md border text-sm transition-colors ${
                petSize === size.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="桌宠形象" description="选择桌宠显示的形象">
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_PRESETS.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => handleAvatarChange(avatar.id)}
              className={`p-2 rounded-lg border text-2xl transition-colors ${
                petAvatarId === avatar.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
              title={avatar.name}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="使用说明" description="桌宠功能介绍">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• 拖动桌宠可以移动位置</p>
          <p>• 点击桌宠可以打开快捷菜单</p>
          <p>• 选择"开始对话"可以打开主窗口</p>
          <p>• 桌宠会自动保存位置</p>
        </div>
      </SettingsSection>
    </div>
  );
}