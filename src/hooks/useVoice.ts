import { useState, useCallback, useEffect } from 'react';
import { voiceService, type VoiceOptions, type SpeechRecognitionResult } from '@/services/voice';
import { useSettingsStore } from '@/stores';

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  voices: SpeechSynthesisVoice[];
  
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

export function useVoice(): UseVoiceReturn {
  const { settings } = useSettingsStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionSupported = voiceService.isRecognitionSupported();
  const synthesisSupported = voiceService.isSynthesisSupported();

  useEffect(() => {
    if (synthesisSupported) {
      voiceService.getVoices().then(v => setVoices(v));
    }
  }, [synthesisSupported]);

  const startListening = useCallback(() => {
    if (!recognitionSupported) {
      setError('当前浏览器不支持语音识别');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    voiceService.startRecognition(
      (result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          setTranscript(prev => prev + result.text);
          setInterimTranscript('');
        } else {
          setInterimTranscript(result.text);
        }
      },
      (err: string) => {
        setError(`语音识别错误: ${err}`);
        setIsListening(false);
      }
    );

    setIsListening(true);
  }, [recognitionSupported]);

  const stopListening = useCallback(() => {
    voiceService.stopRecognition();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!synthesisSupported) {
      setError('当前浏览器不支持语音合成');
      return;
    }

    return new Promise((resolve) => {
      const voiceOptions: VoiceOptions = {
        language: settings.voice?.language || 'zh-CN',
        voiceId: settings.voice?.voiceId || '',
        speed: settings.voice?.speed || 1.0,
        pitch: settings.voice?.pitch || 1.0,
      };

      setIsSpeaking(true);
      voiceService.speak(text, voiceOptions, () => {
        setIsSpeaking(false);
        resolve();
      });
    });
  }, [synthesisSupported, settings.voice]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    voices,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError,
  };
}