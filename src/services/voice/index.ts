import { WebSpeechProvider, type VoiceProvider, type VoiceOptions, type SpeechRecognitionResult } from './webSpeech';

class VoiceService {
  private provider: VoiceProvider;

  constructor() {
    this.provider = new WebSpeechProvider();
  }

  isRecognitionSupported(): boolean {
    return this.provider.isRecognitionSupported();
  }

  isSynthesisSupported(): boolean {
    return this.provider.isSynthesisSupported();
  }

  startRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    this.provider.startRecognition(onResult, onError);
  }

  stopRecognition(): void {
    this.provider.stopRecognition();
  }

  speak(text: string, options: VoiceOptions, onEnd?: () => void): void {
    this.provider.speak(text, options, onEnd);
  }

  stopSpeaking(): void {
    this.provider.stopSpeaking();
  }

  async getVoices() {
    return this.provider.getVoices();
  }
}

export const voiceService = new VoiceService();
export type { VoiceOptions, SpeechRecognitionResult };