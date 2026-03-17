import { useChat } from '@/hooks';
import { ChatWindow } from '@/components/chat';
import { Button } from '@/components/ui';
import { cn } from '@/lib';

function App() {
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    newConversation,
  } = useChat();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 侧边栏 */}
      <aside className="w-64 border-r border-border flex flex-col bg-muted/30">
        {/* 标题和新建按钮 */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">AI 桌面助手</h1>
          <Button onClick={newConversation} className="w-full">
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
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm truncate mb-1",
                conv.id === currentConversationId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {conv.title}
            </button>
          ))}
        </nav>

        {/* 设置入口 */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full">
            设置
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;