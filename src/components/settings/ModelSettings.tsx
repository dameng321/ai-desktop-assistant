import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';

export function ModelSettings() {
  const { settings, updateModel } = useSettingsStore();
  const [apiKey, setApiKey] = useState(settings.model.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.model.baseUrl || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSaveApiKey = () => {
    updateModel({ apiKey, baseUrl });
    // 同时保存到 localStorage 供 AI 服务使用
    localStorage.setItem('openai_api_key', apiKey);
    if (baseUrl) {
      localStorage.setItem('openai_base_url', baseUrl);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${baseUrl || 'https://api.openai.com/v1'}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const modelOptions = [
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ];

  return (
    <div>
      <SettingsSection title="API 配置" description="配置 OpenAI API 密钥">
        <SettingsItem label="API Key" description="你的 OpenAI API 密钥">
          <div className="flex gap-2 w-64">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '隐藏' : '显示'}
            </Button>
          </div>
        </SettingsItem>

        <SettingsItem label="API 地址" description="自定义 API 端点（可选）">
          <Input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-64"
          />
        </SettingsItem>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSaveApiKey}>保存配置</Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!apiKey || isTesting}
          >
            {isTesting ? '测试中...' : '测试连接'}
          </Button>
        </div>

        {testResult && (
          <div
            className={`mt-2 text-sm ${
              testResult === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {testResult === 'success' ? '✓ 连接成功' : '✗ 连接失败，请检查配置'}
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="模型选择">
        <SettingsItem label="默认模型" description="对话使用的默认模型">
          <select
            value={settings.model.model}
            onChange={e => updateModel({ model: e.target.value })}
            className="w-64 h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {modelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="模型参数">
        <SettingsItem label="Temperature" description="控制回复的随机性 (0-2)">
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.model.temperature}
            onChange={e => updateModel({ temperature: parseFloat(e.target.value) })}
            className="w-32"
          />
          <span className="ml-2 text-sm w-8">{settings.model.temperature}</span>
        </SettingsItem>

        <SettingsItem label="Max Tokens" description="回复的最大长度">
          <Input
            type="number"
            value={settings.model.maxTokens}
            onChange={e => updateModel({ maxTokens: parseInt(e.target.value) || 4096 })}
            className="w-32"
            min={100}
            max={128000}
          />
        </SettingsItem>
      </SettingsSection>
    </div>
  );
}