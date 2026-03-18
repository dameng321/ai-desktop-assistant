import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar } from '@/components/avatar';
import { useSettingsStore } from '@/stores';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { cn } from '@/lib';

interface DesktopPetProps {
  onChat?: () => void;
}

export function DesktopPet({ onChat }: DesktopPetProps) {
  const { settings } = useSettingsStore();
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [animation, setAnimation] = useState<'idle' | 'wave' | 'jump'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAvatar = AVATAR_PRESETS.find(p => p.id === settings.avatar?.id);
  const avatarEmoji = currentAvatar?.emoji || '🤖';

  useEffect(() => {
    const savedPosition = localStorage.getItem('desktopPetPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('desktopPetPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    const idleAnimation = setInterval(() => {
      if (!isDragging && !isHovering) {
        setAnimation(Math.random() > 0.7 ? 'wave' : 'idle');
      }
    }, 3000);

    return () => clearInterval(idleAnimation);
  }, [isDragging, isHovering]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setShowMenu(false);
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleClick = () => {
    if (!isDragging) {
      setAnimation('jump');
      setTimeout(() => setAnimation('idle'), 500);
      setShowMenu(!showMenu);
    }
  };

  const handleChat = () => {
    setShowMenu(false);
    onChat?.();
  };

  return (
    <div
      ref={containerRef}
      className="fixed select-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      {/* 桌宠主体 */}
      <div
        className={cn(
          'relative cursor-pointer transition-transform',
          isDragging && 'scale-110',
          animation === 'wave' && 'animate-bounce',
          animation === 'jump' && 'animate-ping'
        )}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 阴影 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 rounded-full blur-sm" />
        
        {/* 头像 */}
        <Avatar 
          emoji={avatarEmoji} 
          size="lg" 
          animate={isHovering || animation !== 'idle'}
          speaking={animation === 'wave'}
        />

        {/* 提示气泡 */}
        {isHovering && !showMenu && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            点击我 ~
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {showMenu && (
        <div 
          className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden min-w-32"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleChat}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
          >
            <span>💬</span> 开始对话
          </button>
          <button
            onClick={() => {
              setAnimation('wave');
              setTimeout(() => setAnimation('idle'), 1000);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
          >
            <span>👋</span> 打招呼
          </button>
          <button
            onClick={() => setPosition({ x: 100, y: 100 })}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
          >
            <span>🏠</span> 重置位置
          </button>
        </div>
      )}
    </div>
  );
}