export interface VoiceOptions {
  language: string;
  voiceId: string;
  speed: number;
  pitch: number;
}

export interface SpeechRecognitionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export interface VoiceProvider {
  startRecognition(onResult: (result: SpeechRecognitionResult) => void, onError?: (error: string) => void): void;
  stopRecognition(): void;
  speak(text: string, options: VoiceOptions, onEnd?: () => void): void;
  stopSpeaking(): void;
  getVoices(): Promise<SpeechSynthesisVoice[]>;
  isRecognitionSupported(): boolean;
  isSynthesisSupported(): boolean;
}

export class WebSpeechProvider implements VoiceProvider {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isListening = false;

  constructor() {
    if (this.isSynthesisSupported()) {
      this.synthesis = window.speechSynthesis;
    }
    
    if (this.isRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  isRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  startRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('语音识别不支持');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      onResult({
        text: result[0].transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence,
      });
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '启动语音识别失败');
    }
  }

  stopRecognition(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options: VoiceOptions, onEnd?: () => void): void {
    if (!this.synthesis) {
      onEnd?.();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.voiceURI === options.voiceId || v.name === options.voiceId);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = options.language;
    utterance.rate = options.speed;
    utterance.pitch = options.pitch;

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synthesis) {
      return [];
    }

    let voices = this.synthesis.getVoices();
    
    if (voices.length === 0) {
      await new Promise<void>((resolve) => {
        const handler = () => {
          voices = this.synthesis!.getVoices();
          this.synthesis!.removeEventListener('voiceschanged', handler);
          resolve();
        };
        this.synthesis!.addEventListener('voiceschanged', handler);
        
        setTimeout(() => {
          this.synthesis!.removeEventListener('voiceschanged', handler);
          resolve();
        }, 1000);
      });
    }

    return voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('en'));
  }
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}