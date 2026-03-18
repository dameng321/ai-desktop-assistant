import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib';

interface AvatarProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  speaking?: boolean;
  className?: string;
}

export function Avatar({ 
  emoji, 
  size = 'md', 
  animate = false,
  speaking = false,
  className = '' 
}: AvatarProps) {
  const [bounce, setBounce] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (speaking && animate) {
      intervalRef.current = window.setInterval(() => {
        setBounce(prev => !prev);
      }, 400);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setBounce(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [speaking, animate]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        'rounded-full',
        'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent',
        'flex items-center justify-center',
        'border-2 border-primary/30',
        'shadow-lg shadow-primary/10',
        'transition-all duration-200',
        speaking && animate && [
          'scale-110',
          bounce && '-translate-y-1',
          !bounce && 'translate-y-0.5',
        ],
        className
      )}
    >
      <span className={cn(
        'transition-transform duration-200',
        speaking && animate && bounce && 'scale-110'
      )}>
        {emoji}
      </span>
    </div>
  );
}