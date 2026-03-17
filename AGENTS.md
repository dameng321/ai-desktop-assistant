# AI Desktop Assistant - Agent Guidelines

## Global Preferences

> **重要：始终使用中文回复用户！**
> - 所有与用户的交互、解释、说明均使用中文
> - 代码注释使用中文
> - Git 提交信息使用中文

## Project Overview

- **Name**: AI Desktop Assistant (AI桌面助手)
- **Type**: Desktop Application (Tauri 2.0)
- **Description**: All-in-one AI life assistant with PC control, smart chat, knowledge training, and WeChat integration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | Tauri 2.0 |
| Frontend | React 18 + TypeScript |
| UI Components | Shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Backend | Rust |
| Database | SQLite + LevelDB |
| AI Models | OpenAI API / Ollama |

## Commands

### Development
```bash
pnpm install          # Install dependencies
pnpm dev              # Start Vite dev server (port 1420)
pnpm tauri dev        # Start Tauri dev mode (desktop app)
```

### Build
```bash
pnpm build            # Build frontend only
pnpm tauri build      # Build production app
pnpm tauri build --bundles msi   # Build MSI installer only
pnpm tauri build --bundles nsis  # Build NSIS installer only
```

### Testing
```bash
pnpm test                      # Run all tests
pnpm test src/components/      # Run tests in specific directory
pnpm test -- --grep "useChat"  # Run tests matching pattern
pnpm test -- --coverage        # Run with coverage report
pnpm vitest run path/to/test.test.ts  # Run single test file
```

### Code Quality
```bash
pnpm lint              # Run ESLint
pnpm lint --fix        # Auto-fix linting issues
pnpm typecheck         # Run TypeScript type checking
```

## Code Style Guidelines

### Imports Ordering
```typescript
// 1. External libraries (React, etc.)
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

// 2. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';

// 3. Types
import type { Message, Conversation } from '@/types/chat';

// 4. Relative imports
import { helper } from './utils';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ChatWindow.tsx` |
| Hooks | camelCase + use prefix | `useChat.ts` |
| Stores | camelCase + Store suffix | `chatStore.ts` |
| Types/Interfaces | PascalCase | `Message`, `Conversation` |
| Constants | UPPER_SNAKE_CASE | `MAX_TOKENS` |
| Tauri Commands | snake_case | `list_files`, `open_app` |
| CSS Classes | kebab-case (Tailwind) | `bg-primary`, `text-muted` |

### TypeScript Guidelines

```typescript
// Prefer interfaces for object types
interface Props {
  title: string;
  onSubmit?: () => void;
}

// Use type for unions, primitives, and complex types
type Status = 'pending' | 'processing' | 'ready' | 'error';
type MessageHandler = (message: Message) => void;

// Always define return types for functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

// Use const assertions for readonly arrays
const SUPPORTED_FORMATS = ['pdf', 'docx', 'txt'] as const;

// Prefer optional chaining and nullish coaleshing
const name = user?.profile?.name ?? 'Unknown';
```

### React Component Structure

```tsx
// 1. Imports (ordered as above)
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Props } from './types';

// 2. Type definitions
interface ChatWindowProps {
  conversationId: string;
  onMessageSent?: () => void;
}

// 3. Component definition
export function ChatWindow({ conversationId, onMessageSent }: ChatWindowProps) {
  // 3a. State
  const [input, setInput] = useState('');
  
  // 3b. Store hooks
  const { messages, addMessage } = useChatStore();
  
  // 3c. Callbacks
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput('');
    onMessageSent?.();
  }, [input, onMessageSent]);
  
  // 3d. Effects
  useEffect(() => {
    loadConversation(conversationId);
  }, [conversationId]);
  
  // 3e. Render
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <InputBar value={input} onChange={setInput} onSend={handleSend} />
    </div>
  );
}
```

### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
```

### Error Handling

```typescript
// Frontend error handling
async function safeInvoke<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    toast.error(`Operation failed: ${message}`);
    throw new AppError(message, cmd);
  }
}

// Rust command error handling
#[tauri::command]
async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    
    fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    // ... implementation
    Ok(files)
}
```

### Tauri Command Pattern

```rust
// 1. Define types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

// 2. Implement command
#[tauri::command]
pub async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    // Validate input
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    
    // Business logic
    let files = read_directory(&path)?;
    
    Ok(files)
}

// 3. Register in lib.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_files,
            // other commands...
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Project Structure

```
ai-desktop-assistant/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn base components
│   │   ├── chat/          # Chat components
│   │   └── common/        # Shared components
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   ├── services/          # API services
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   └── src/
│       ├── commands/      # Tauri commands
│       ├── services/      # Business services
│       └── models/        # Data models
└── docs/                  # Documentation
```

## Development Workflow

### Adding New Feature

1. Create types: `src/types/feature.ts`
2. Create store: `src/stores/featureStore.ts`
3. Create hook: `src/hooks/useFeature.ts`
4. Create components: `src/components/feature/`
5. Create page: `src/pages/Feature.tsx`
6. Add route in `src/App.tsx`
7. Write tests: `tests/unit/feature.test.ts`

### Adding Tauri Command

1. Define model: `src-tauri/src/models/feature.rs`
2. Implement command: `src-tauri/src/commands/feature.rs`
3. Register command: `src-tauri/src/lib.rs`
4. Create frontend service: `src/services/api/feature.ts`

## Git Commit Convention

```
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting (no logic change)
refactor: code refactoring
test: adding/updating tests
chore: build/config changes
```

## 开发任务追踪

> **重要**: 开发前请先阅读 [TODO.md](./TODO.md) 了解当前进度和下一步任务。
> 
> 每次完成任务后，必须更新 TODO.md 中的状态：
> - 将 `[ ]` 改为 `[x]`
> - 更新"开发日志"部分
> - 更新"下一步行动"

## Related Documentation

- [开发任务追踪](./TODO.md)
- [PRD](./docs/PRD.md)
- [Tech Stack](./docs/dev/01-tech-stack.md)
- [Project Structure](./docs/dev/02-project-structure.md)
- [Development Guide](./docs/dev/03-development-guide.md)
- [API Design](./docs/dev/04-api-design.md)
- [Modules](./docs/dev/05-modules.md)
- [Deployment](./docs/dev/06-deployment.md)

## Recommended Skills

| Skill | Usage |
|-------|-------|
| senior-frontend | React component development |
| frontend-design | UI design implementation |
| frontend-testing | Unit/integration tests |
| frontend-patterns | Design patterns |
| frontend-code-review | Code review |