import { useState, useEffect, useCallback } from 'react';
import { Button, useToast } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';

export function PetSettings() {
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettingsStore();
  const [isPetVisible, setIsPetVisible] = useState(false);

  const checkPetWindow = useCallback(async () => {
    try {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
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
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      let petWindow = await WebviewWindow.getByLabel('pet');
      
      if (!petWindow) {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        petWindow = new WebviewWindow('pet', {
          url: '/pet',
          decorations: false,
          transparent: true,
          alwaysOnTop: true,
          skipTaskbar: true,
          width: 200,
          height: 200,
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
      showToast('操作失败', 'error');
    }
  }, [showToast]);

  const petEnabled = settings.pet?.enabled ?? false;

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