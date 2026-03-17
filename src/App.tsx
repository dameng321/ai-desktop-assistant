import { useState } from 'react';
import { useChat } from '@/hooks';
import { ChatWindow, ConversationItem } from '@/components/chat';
import { SettingsPage } from '@/components/settings';
import { FileManager } from '@/components/control';
import { Button } from '@/components/ui';
import { cn } from '@/lib';

type View = 'chat' | 'files' | 'settings';

function App() {
  const [view, setView] = useState<View>('chat');
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    newConversation,
    deleteConversation,
    updateConversationTitle,
  } = useChat();

  const renderMainContent = () => {
    switch (view) {
      case 'chat':
        return <ChatWindow />;
      case 'files':
        return <FileManager />;
      case 'settings':
        return <SettingsPage onClose={() => setView('chat')} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 侧边栏 */}
      <aside className="w-64 border-r border-border flex flex-col bg-muted/30">
        {/* 标题 */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">AI 桌面助手</h1>
          
          {/* 对话功能按钮 */}
          {view === 'chat' && (
            <Button
              onClick={() => {
                newConversation();
              }}
              className="w-full"
            >
              新建对话
            </Button>
          )}
        </div>

        {/* 内容区 - 对话列表或功能导航 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'chat' ? (
            <>
              {/* 对话列表 */}
              <nav className="flex-1 overflow-auto p-2">
                {conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    暂无对话
                  </p>
                )}
                {conversations.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={() => setCurrentConversation(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onRename={title => updateConversationTitle(conv.id, title)}
                  />
                ))}
              </nav>
            </>
          ) : (
            /* 功能导航 */
            <div className="p-2 space-y-1">
              <button
                onClick={() => setView('chat')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                智能对话
              </button>
              
              <button
                onClick={() => setView('files')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                  view === 'files' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                文件管理
              </button>
              
              <button
                onClick={() => setView('settings')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                  view === 'settings' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </button>
            </div>
          )}
        </div>

        {/* 底部导航 */}
        <div className="p-2 border-t border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setView('chat')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-xs",
                view === 'chat' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              对话
            </button>
            <button
              onClick={() => setView('files')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-xs",
                view === 'files' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              文件
            </button>
            <button
              onClick={() => setView('settings')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-xs",
                view === 'settings' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;