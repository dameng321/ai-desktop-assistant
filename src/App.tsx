import { useState } from 'react';
import { useChat } from '@/hooks';
import { ChatWindow, ConversationItem } from '@/components/chat';
import { SettingsPage } from '@/components/settings';
import { Button } from '@/components/ui';

type View = 'chat' | 'settings';

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

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 侧边栏 */}
      <aside className="w-64 border-r border-border flex flex-col bg-muted/30">
        {/* 标题和新建按钮 */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">AI 桌面助手</h1>
          <Button
            onClick={() => {
              newConversation();
              setView('chat');
            }}
            className="w-full"
          >
            新建对话
          </Button>
        </div>

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
              isActive={conv.id === currentConversationId && view === 'chat'}
              onSelect={() => {
                setCurrentConversation(conv.id);
                setView('chat');
              }}
              onDelete={() => deleteConversation(conv.id)}
              onRename={title => updateConversationTitle(conv.id, title)}
            />
          ))}
        </nav>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant={view === 'settings' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setView('settings')}
          >
            ⚙️ 设置
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {view === 'chat' ? (
          <ChatWindow />
        ) : (
          <SettingsPage onClose={() => setView('chat')} />
        )}
      </main>
    </div>
  );
}

export default App;