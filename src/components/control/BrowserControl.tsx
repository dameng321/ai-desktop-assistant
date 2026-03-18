import { useState, useCallback } from 'react';
import { Button, Input, useToast } from '@/components/ui';
import { appService } from '@/services/api';

interface BrowserBookmark {
  name: string;
  url: string;
}

const defaultBookmarks: BrowserBookmark[] = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { name: 'MDN', url: 'https://developer.mozilla.org' },
  { name: 'ChatGPT', url: 'https://chat.openai.com' },
  { name: 'Claude', url: 'https://claude.ai' },
];

export function BrowserControl() {
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [customBookmarks, setCustomBookmarks] = useState<BrowserBookmark[]>(() => {
    const saved = localStorage.getItem('browserBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const handleOpenUrl = useCallback(async (urlToOpen?: string) => {
    const targetUrl = urlToOpen || url;
    if (!targetUrl.trim()) {
      showToast('请输入网址', 'error');
      return;
    }

    let finalUrl = targetUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      await appService.openUrl(finalUrl);
      showToast(`已打开: ${finalUrl}`, 'success');
    } catch (err) {
      console.error('打开网址失败:', err);
      showToast('打开网址失败', 'error');
    }
  }, [url, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpenUrl();
    }
  };

  const handleAddBookmark = () => {
    if (!url.trim()) return;
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newBookmark: BrowserBookmark = {
      name: finalUrl.replace(/^https?:\/\//, '').split('/')[0],
      url: finalUrl,
    };

    const updated = [...customBookmarks, newBookmark];
    setCustomBookmarks(updated);
    localStorage.setItem('browserBookmarks', JSON.stringify(updated));
    showToast('已添加书签', 'success');
  };

  const handleRemoveBookmark = (index: number) => {
    const updated = customBookmarks.filter((_, i) => i !== index);
    setCustomBookmarks(updated);
    localStorage.setItem('browserBookmarks', JSON.stringify(updated));
  };

  const allBookmarks = [...defaultBookmarks, ...customBookmarks];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">浏览器控制</h2>
        
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入网址..."
            className="flex-1"
          />
          <Button onClick={() => handleOpenUrl()}>打开</Button>
          <Button variant="outline" onClick={handleAddBookmark} disabled={!url.trim()}>
            收藏
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">快捷访问</h3>
        
        <div className="grid grid-cols-4 gap-3">
          {allBookmarks.map((bookmark, index) => (
            <div
              key={`${bookmark.url}-${index}`}
              className="relative group"
            >
              <button
                onClick={() => handleOpenUrl(bookmark.url)}
                className="w-full flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mb-2">
                  {bookmark.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-center truncate w-full">{bookmark.name}</span>
              </button>
              
              {index >= defaultBookmarks.length && (
                <button
                  onClick={() => handleRemoveBookmark(index - defaultBookmarks.length)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          输入网址后按 Enter 快速打开，或点击快捷访问图标
        </p>
      </div>
    </div>
  );
}