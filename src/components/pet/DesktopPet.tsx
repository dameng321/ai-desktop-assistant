import { useState, useEffect, useRef, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { PhysicalPosition } from '@tauri-apps/api/dpi';
import { Avatar } from '@/components/avatar';
import { useSettingsStore } from '@/stores';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { cn } from '@/lib';

interface DesktopPetProps {
  onChat?: () => void;
}

const PET_SIZE_MAP = {
  small: 'md' as const,
  medium: 'lg' as const,
  large: 'xl' as const,
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
  const appWindowRef = useRef<ReturnType<typeof getCurrentWindow> | null>(null);

  useEffect(() => {
    appWindowRef.current = getCurrentWindow();
    
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
  const avatarSize = PET_SIZE_MAP[petSize];

  const currentAvatar = AVATAR_PRESETS.find(p => p.id === petAvatarId);
  const avatarEmoji = currentAvatar?.emoji || '🤖';

  useEffect(() => {
    const savedPosition = localStorage.getItem('desktopPetPosition');
    if (savedPosition) {
      try {
        const saved = JSON.parse(savedPosition);
        setPosition(saved);
        if (appWindowRef.current) {
          appWindowRef.current.setPosition(new PhysicalPosition(saved.x, saved.y));
        }
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
      x: e.clientX,
      y: e.clientY,
    });
    setShowMenu(false);
  }, []);

  const handleMouseMove = useCallback(async (e: MouseEvent) => {
    if (!isDragging || !appWindowRef.current) return;
    
    const newX = e.screenX - dragOffset.x;
    const newY = e.screenY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
    
    await appWindowRef.current.setPosition(new PhysicalPosition(newX, newY));
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

  const handleResetPosition = async () => {
    const newPos = { x: 100, y: 100 };
    setPosition(newPos);
    if (appWindowRef.current) {
      await appWindowRef.current.setPosition(new PhysicalPosition(100, 100));
    }
  };

  return (
    <div
      className={cn(
        'select-none flex items-center justify-center',
        isDragging && 'cursor-grabbing'
      )}
      style={{ width: '100vw', height: '100vh' }}
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
          size={avatarSize} 
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
            onClick={handleResetPosition}
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