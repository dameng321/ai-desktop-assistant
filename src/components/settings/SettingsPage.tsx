import { useState } from 'react';
import { Button } from '@/components/ui';
import { SettingsLayout, SettingsSection, SettingsItem } from './SettingsLayout';
import { ModelSettings } from './ModelSettings';
import { GeneralSettings } from './GeneralSettings';
import { ShortcutSettings } from './ShortcutSettings';
import { VoiceSettings } from './VoiceSettings';

type SettingsTab = 'general' | 'model' | 'voice' | 'shortcuts' | 'privacy';

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: '通用' },
  { id: 'model', label: '模型' },
  { id: 'voice', label: '语音' },
  { id: 'shortcuts', label: '快捷键' },
  { id: 'privacy', label: '隐私' },
];

interface SettingsPageProps {
  onClose?: () => void;
}

export function SettingsPage({ onClose }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <SettingsLayout title="通用设置" description="配置应用的基本选项">
            <GeneralSettings />
          </SettingsLayout>
        );
      case 'model':
        return (
          <SettingsLayout title="模型设置" description="配置 AI 模型和 API">
            <ModelSettings />
          </SettingsLayout>
        );
      case 'voice':
        return (
          <SettingsLayout title="语音设置" description="配置语音输入和输出">
            <VoiceSettings />
          </SettingsLayout>
        );
      case 'shortcuts':
        return (
          <SettingsLayout title="快捷键设置" description="自定义快捷键">
            <ShortcutSettings />
          </SettingsLayout>
        );
      case 'privacy':
        return (
          <SettingsLayout title="隐私设置" description="数据和隐私管理">
            <SettingsSection title="数据管理">
              <SettingsItem label="导出数据" description="导出所有用户数据">
                <Button variant="outline" size="sm">
                  导出
                </Button>
              </SettingsItem>
              <SettingsItem label="清除对话数据" description="删除所有对话历史">
                <Button variant="destructive" size="sm">
                  清除
                </Button>
              </SettingsItem>
            </SettingsSection>
          </SettingsLayout>
        );
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* 侧边导航 */}
      <aside className="w-48 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">设置</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 内容区 */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}