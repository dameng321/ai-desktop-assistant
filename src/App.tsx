import { useState } from 'react';
import { useChatStore } from '@/stores';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib';

function App() {
  const { conversations, currentConversationId, createConversation, addMessage, setCurrentConversation } = useChatStore();
  const [input, setInput] = useState('');
  
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const handleSend = () => {
    if (!input.trim()) return;
    
    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation();
    }
    
    addMessage(convId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    });
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={() => createConversation()} className="w-full">
            新建对话
          </Button>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm truncate",
                conv.id === currentConversationId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {conv.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4">
          {currentConversation?.messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              开始一段新对话
            </div>
          )}
          {currentConversation?.messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "mb-4 p-3 rounded-lg max-w-[80%]",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              className="flex-1"
            />
            <Button onClick={handleSend}>发送</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;