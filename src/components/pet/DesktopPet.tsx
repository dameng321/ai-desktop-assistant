import { useState, useEffect, useRef, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Avatar } from '@/components/avatar';
import { useSettingsStore } from '@/stores';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { cn } from '@/lib';

interface DesktopPetProps {
  onChat?: () => void;
}

const PET_SIZE_MAP = {
  small: { avatar: 'md' as const, container: 80 },
  medium: { avatar: 'lg' as const, container: 120 },
  large: { avatar: 'xl' as const, container: 160 },
};

export function DesktopPet({ onChat }: DesktopPetProps) {
  const { settings } = useSettingsStore();
  const [, forceUpdate] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [animation, setAnimation] = useState<'idle' | 'wave' | 'jump'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unlisten = listen('settings-changed', () => {
      useSettingsStore.persist.rehydrate();
      forceUpdate(n => n + 1);
    });
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const petAvatarId = settings.pet?.avatarId ?? settings.avatar?.id ?? 'robot';
  const petSize = settings.pet?.size ?? 'medium';
  const sizeConfig = PET_SIZE_MAP[petSize];

  const currentAvatar = AVATAR_PRESETS.find(p => p.id === petAvatarId);
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
      if (!isDragging && !isHovering && !showMenu) {
        setAnimation(Math.random() > 0.7 ? 'wave' : 'idle');
      }
    }, 3000);

    return () => clearInterval(idleAnimation);
  }, [isDragging, isHovering, showMenu]);

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
    
    const maxX = window.innerWidth - sizeConfig.container;
    const maxY = window.innerHeight - sizeConfig.container;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging, dragOffset, sizeConfig.container]);

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
        <Avatar 
          emoji={avatarEmoji} 
          size={sizeConfig.avatar} 
          animate={isHovering || animation !== 'idle'}
          speaking={animation === 'wave'}
          transparent
        />

        {isHovering && !showMenu && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            点击我 ~
          </div>
        )}
      </div>

      {showMenu && (
        <div 
          className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-32"
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
          <button
            onClick={() => setShowMenu(false)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 border-t border-border"
          >
            <span>✕</span> 关闭菜单
          </button>
        </div>
      )}
    </div>
  );
}