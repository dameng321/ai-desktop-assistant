import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';
import { createCustomProvider } from '@/lib/providers';
import { systemService } from '@/services/api';
import type { ModelProvider } from '@/types';

export function ModelSettings() {
  const { settings, updateModel, updateProvider, addCustomProvider, removeProvider, setActiveProvider } = useSettingsStore();
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderUrl, setNewProviderUrl] = useState('');
  const [newModelInput, setNewModelInput] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'success' | 'error' | null>>({});
  const [testError, setTestError] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  const activeProvider = settings.model.providers.find(p => p.id === settings.model.activeProviderId);

  const handleTestConnection = async (provider: ModelProvider) => {
    if (!provider.apiKey && provider.id !== 'ollama') return;
    
    setIsTesting(provider.id);
    setTestResult(prev => ({ ...prev, [provider.id]: null }));
    setTestError(prev => ({ ...prev, [provider.id]: '' }));
    
    try {
      await systemService.testApiConnection(
        provider.baseUrl,
        provider.apiKey,
        provider.id
      );
      setTestResult(prev => ({ ...prev, [provider.id]: 'success' }));
    } catch (err) {
      setTestResult(prev => ({ ...prev, [provider.id]: 'error' }));
      setTestError(prev => ({ 
        ...prev, 
        [provider.id]: err instanceof Error ? err.message : String(err) 
      }));
    } finally {
      setIsTesting(null);
    }
  };

  const handleAddCustomProvider = () => {
    if (!newProviderName.trim() || !newProviderUrl.trim()) return;
    
    const provider = createCustomProvider(newProviderName.trim(), newProviderUrl.trim());
    addCustomProvider(provider);
    setActiveProvider(provider.id);
    
    setNewProviderName('');
    setNewProviderUrl('');
    setShowAddProvider(false);
  };

  const handleAddCustomModel = (providerId: string) => {
    const modelId = newModelInput[providerId]?.trim();
    if (!modelId) return;
    
    const provider = settings.model.providers.find(p => p.id === providerId);
    if (!provider) return;
    
    const newModel = { id: modelId, name: modelId };
    const updatedModels = [...provider.models, newModel];
    
    updateProvider(providerId, { models: updatedModels });
    
    // 如果是第一个模型，自动设为默认模型
    if (provider.models.length === 0) {
      updateModel({ defaultModelId: modelId });
    }
    
    setNewModelInput(prev => ({ ...prev, [providerId]: '' }));
  };

  const handleRemoveProvider = (providerId: string) => {
    if (settings.model.providers.length <= 1) return;
    const provider = settings.model.providers.find(p => p.id === providerId);
    if (provider?.type === 'preset') return;
    removeProvider(providerId);
  };

  return (
    <div className="space-y-6">
      <SettingsSection title="模型供应商" description="选择并配置 AI 模型供应商">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {settings.model.providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setActiveProvider(provider.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  settings.model.activeProviderId === provider.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {provider.name}
                {provider.type === 'custom' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProvider(provider.id);
                    }}
                    className="ml-2 opacity-60 hover:opacity-100"
                  >
                    ✕
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowAddProvider(true)}
              className="px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted/80"
            >
              + 添加供应商
            </button>
          </div>
        </div>
      </SettingsSection>

      {showAddProvider && (
        <SettingsSection title="添加自定义供应商" description="配置自定义 API 端点">
          <div className="space-y-3">
            <SettingsItem label="供应商名称" description="显示名称">
              <Input
                value={newProviderName}
                onChange={e => setNewProviderName(e.target.value)}
                placeholder="例如: My AI Service"
                className="w-64"
              />
            </SettingsItem>
            <SettingsItem label="API 地址" description="OpenAI 兼容的 API 端点">
              <Input
                value={newProviderUrl}
                onChange={e => setNewProviderUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-64"
              />
            </SettingsItem>
            <div className="flex gap-2">
              <Button onClick={handleAddCustomProvider} disabled={!newProviderName || !newProviderUrl}>
                添加
              </Button>
              <Button variant="outline" onClick={() => setShowAddProvider(false)}>
                取消
              </Button>
            </div>
          </div>
        </SettingsSection>
      )}

      {activeProvider && (
        <>
          <SettingsSection 
            title={`${activeProvider.name} 配置`} 
            description={activeProvider.type === 'preset' ? '预设供应商配置' : '自定义供应商配置'}
          >
            {activeProvider.id !== 'ollama' && (
              <SettingsItem label="API Key" description="API 密钥">
                <div className="flex gap-2 w-80">
                  <Input
                    type={showApiKey[activeProvider.id] ? 'text' : 'password'}
                    value={activeProvider.apiKey}
                    onChange={e => updateProvider(activeProvider.id, { apiKey: e.target.value })}
                    placeholder={activeProvider.id === 'google' ? 'AIza...' : 'sk-...'}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(prev => ({ ...prev, [activeProvider.id]: !prev[activeProvider.id] }))}
                  >
                    {showApiKey[activeProvider.id] ? '隐藏' : '显示'}
                  </Button>
                </div>
              </SettingsItem>
            )}

            <SettingsItem label="API 地址" description="自定义 API 端点">
              <Input
                value={activeProvider.baseUrl}
                onChange={e => updateProvider(activeProvider.id, { baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="w-80"
              />
            </SettingsItem>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleTestConnection(activeProvider)}
                disabled={isTesting === activeProvider.id}
              >
                {isTesting === activeProvider.id ? '测试中...' : '测试连接'}
              </Button>
            </div>

            {testResult[activeProvider.id] && (
              <div
                className={`mt-2 text-sm ${
                  testResult[activeProvider.id] === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {testResult[activeProvider.id] === 'success' 
                  ? '✓ 连接成功' 
                  : `✗ ${testError[activeProvider.id] || '连接失败，请检查配置'}`}
              </div>
            )}
          </SettingsSection>

          <SettingsSection title="模型选择" description="选择默认使用的模型">
            {activeProvider.models.length > 0 ? (
              <SettingsItem label="默认模型" description="对话使用的默认模型">
                <select
                  value={settings.model.defaultModelId}
                  onChange={e => updateModel({ defaultModelId: e.target.value })}
                  className="w-80 h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {activeProvider.models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </SettingsItem>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {activeProvider.id === 'ollama' 
                    ? 'Ollama 需要先拉取模型。请手动添加模型名称：'
                    : '暂无预设模型，请添加模型：'}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newModelInput[activeProvider.id] || ''}
                    onChange={e => setNewModelInput(prev => ({ ...prev, [activeProvider.id]: e.target.value }))}
                    placeholder={activeProvider.id === 'ollama' ? 'llama3.2, qwen2.5, ...' : '模型 ID'}
                    className="w-64"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddCustomModel(activeProvider.id);
                      }
                    }}
                  />
                  <Button onClick={() => handleAddCustomModel(activeProvider.id)}>
                    添加模型
                  </Button>
                </div>
                {activeProvider.models.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeProvider.models.map(model => (
                      <span
                        key={model.id}
                        className="px-2 py-1 bg-muted rounded text-sm flex items-center gap-1"
                      >
                        {model.name}
                        <button
                          onClick={() => {
                            updateProvider(activeProvider.id, {
                              models: activeProvider.models.filter(m => m.id !== model.id)
                            });
                          }}
                          className="opacity-60 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeProvider.models.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">快速添加其他模型：</p>
                <div className="flex gap-2">
                  <Input
                    value={newModelInput[activeProvider.id] || ''}
                    onChange={e => setNewModelInput(prev => ({ ...prev, [activeProvider.id]: e.target.value }))}
                    placeholder="输入模型 ID"
                    className="w-64"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddCustomModel(activeProvider.id);
                      }
                    }}
                  />
                  <Button variant="outline" onClick={() => handleAddCustomModel(activeProvider.id)}>
                    添加
                  </Button>
                </div>
              </div>
            )}
          </SettingsSection>
        </>
      )}

      <SettingsSection title="模型参数" description="全局模型参数设置">
        <SettingsItem label="Temperature" description="控制回复的随机性 (0-2)">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.model.temperature}
              onChange={e => updateModel({ temperature: parseFloat(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm w-8">{settings.model.temperature}</span>
          </div>
        </SettingsItem>

        <SettingsItem label="Max Tokens" description="回复的最大长度">
          <Input
            type="number"
            value={settings.model.maxTokens}
            onChange={e => updateModel({ maxTokens: parseInt(e.target.value) || 4096 })}
            className="w-32"
            min={100}
            max={2000000}
          />
        </SettingsItem>
      </SettingsSection>
    </div>
  );
}