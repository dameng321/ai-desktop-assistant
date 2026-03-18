import { useEffect } from 'react';
import { DesktopPet } from '@/components/pet';

export function PetWindow() {
  useEffect(() => {
    document.addEventListener('mousedown', async (e) => {
      if ((e.target as HTMLElement).tagName === 'DIV' && 
          (e.target as HTMLElement).classList.contains('fixed')) {
        return;
      }
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    return () => {
      document.removeEventListener('mousedown', () => {});
      document.removeEventListener('contextmenu', () => {});
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
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <DesktopPet onChat={handleChat} />
    </div>
  );
}