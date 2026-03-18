import { useEffect, useState } from 'react';
import { cn } from '@/lib';

interface WakeUpAnimationProps {
  isVisible: boolean;
  onAnimationEnd?: () => void;
}

export function WakeUpAnimation({ isVisible, onAnimationEnd }: WakeUpAnimationProps) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit' | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setPhase('enter');
      
      const timer1 = setTimeout(() => setPhase('active'), 300);
      const timer2 = setTimeout(() => {
        setPhase('exit');
        setTimeout(() => {
          setShow(false);
          onAnimationEnd?.();
        }, 300);
      }, 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isVisible, onAnimationEnd]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "flex flex-col items-center gap-4 transition-all duration-300",
          phase === 'enter' && "scale-0 opacity-0",
          phase === 'active' && "scale-100 opacity-100",
          phase === 'exit' && "scale-110 opacity-0"
        )}
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl animate-pulse">
            🤖
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        </div>
        <div className="text-lg font-medium">AI 助手已唤醒</div>
        <div className="text-sm text-muted-foreground">正在准备...</div>
      </div>
    </div>
  );
}