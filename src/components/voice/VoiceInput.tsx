import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { useVoice } from '@/hooks';
import { cn } from '@/lib';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInput({ onResult, className, disabled }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
  } = useVoice();

  useEffect(() => {
    if (transcript && !isListening) {
      onResult(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, onResult, clearTranscript]);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearError();
      startListening();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant={isListening ? 'default' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className={cn(isListening && 'animate-pulse')}
      >
        {isListening ? '🎤 录音中...' : '🎤'}
      </Button>

      {isListening && (
        <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-background border border-border rounded-md shadow-lg min-w-[200px] z-10">
          <div className="text-sm">
            {transcript && (
              <span className="text-foreground">{transcript}</span>
            )}
            {interimTranscript && (
              <span className="text-muted-foreground">{interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && (
              <span className="text-muted-foreground">请说话...</span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 min-w-[200px] z-10">
          {error}
          <button
            onClick={clearError}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}