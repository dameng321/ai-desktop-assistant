import { useState, useEffect, useRef } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (speaking && animate) {
      setIsAnimating(true);
      const animateAvatar = () => {
        setIsAnimating(prev => !prev);
        animationRef.current = window.setTimeout(animateAvatar, 300);
      };
      animationRef.current = window.setTimeout(animateAvatar, 300);
    } else {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      setIsAnimating(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [speaking, animate]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-full bg-gradient-to-br from-primary/20 to-primary/5
        flex items-center justify-center
        border-2 border-primary/30
        shadow-lg shadow-primary/10
        transition-all duration-300
        ${isAnimating ? 'scale-110 -translate-y-0.5' : 'scale-100'}
        ${className}
      `}
    >
      <span className={isAnimating ? 'animate-bounce' : ''}>{emoji}</span>
    </div>
  );
}