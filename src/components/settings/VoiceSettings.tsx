import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { SettingsSection, SettingsItem } from './SettingsLayout';
import { useSettingsStore } from '@/stores';
import { voiceService } from '@/services/voice';

export function VoiceSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState('你好，这是一段语音测试。');

  const voice = settings.voice || {
    enabled: true,
    language: 'zh-CN',
    voiceId: '',
    speed: 1.0,
    pitch: 1.0,
  };

  useEffect(() => {
    voiceService.getVoices().then(v => {
      setVoices(v);
    });
  }, []);

  const handleTestVoice = () => {
    voiceService.speak(testText, {
      language: voice.language,
      voiceId: voice.voiceId,
      speed: voice.speed,
      pitch: voice.pitch,
    });
  };

  const handleStopVoice = () => {
    voiceService.stopSpeaking();
  };

  const filteredVoices = voices.filter(v => 
    v.lang.startsWith(voice.language.split('-')[0])
  );

  return (
    <div className="space-y-6">
      <SettingsSection title="语音功能" description="配置语音输入和输出">
        <SettingsItem label="启用语音" description="开启语音功能">
          <button
            onClick={() => updateSettings({
              voice: { ...voice, enabled: !voice.enabled }
            })}
            className={`w-12 h-6 rounded-full transition-colors ${
              voice.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              voice.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="语音识别" description="语音输入设置">
        <SettingsItem label="识别语言" description="语音识别的语言">
          <select
            value={voice.language}
            onChange={e => updateSettings({
              voice: { ...voice, language: e.target.value }
            })}
            className="w-40 h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="zh-CN">中文 (简体)</option>
            <option value="zh-TW">中文 (繁体)</option>
            <option value="en-US">英语 (美国)</option>
            <option value="en-GB">英语 (英国)</option>
            <option value="ja-JP">日语</option>
            <option value="ko-KR">韩语</option>
          </select>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="语音合成" description="语音输出设置">
        <SettingsItem label="语音声音" description="选择合成的声音">
          <select
            value={voice.voiceId}
            onChange={e => updateSettings({
              voice: { ...voice, voiceId: e.target.value }
            })}
            className="w-64 h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">默认声音</option>
            {filteredVoices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </SettingsItem>

        <SettingsItem label="语速" description={`朗读速度 (${voice.speed.toFixed(1)}x)`}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voice.speed}
              onChange={e => updateSettings({
                voice: { ...voice, speed: parseFloat(e.target.value) }
              })}
              className="w-32"
            />
            <span className="text-sm w-8">{voice.speed.toFixed(1)}</span>
          </div>
        </SettingsItem>

        <SettingsItem label="音调" description={`声音音调 (${voice.pitch.toFixed(1)})`}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voice.pitch}
              onChange={e => updateSettings({
                voice: { ...voice, pitch: parseFloat(e.target.value) }
              })}
              className="w-32"
            />
            <span className="text-sm w-8">{voice.pitch.toFixed(1)}</span>
          </div>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="测试" description="测试语音效果">
        <div className="space-y-3">
          <Input
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="输入测试文本..."
            className="w-full"
          />
          <div className="flex gap-2">
            <Button onClick={handleTestVoice}>
              播放测试
            </Button>
            <Button variant="outline" onClick={handleStopVoice}>
              停止
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}