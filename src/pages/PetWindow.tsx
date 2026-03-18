import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { DesktopPet } from '@/components/pet';

export function PetWindow() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unlisten = listen('settings-changed', () => {
      forceUpdate(n => n + 1);
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const handleChat = async () => {
    const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
    const mainWindow = await WebviewWindow.getByLabel('main');
    if (mainWindow) {
      await mainWindow.show();
      await mainWindow.setFocus();
    }
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <DesktopPet onChat={handleChat} />
    </div>
  );
}