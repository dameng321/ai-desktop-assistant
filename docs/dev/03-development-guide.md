# 开发指南

## 开发环境搭建

### 1. 安装依赖

**系统要求**：
- Node.js >= 18.0.0
- Rust >= 1.70
- pnpm >= 8.0.0

**安装 Node.js**：
```bash
# 使用 nvm (推荐)
nvm install 18
nvm use 18

# 或直接下载安装
# https://nodejs.org/
```

**安装 Rust**：
```bash
# Windows
# 下载安装 rustup-init.exe
# https://rustup.rs/

# 或使用命令
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**安装 pnpm**：
```bash
npm install -g pnpm
```

### 2. 克隆项目

```bash
git clone https://github.com/xxx/ai-desktop-assistant.git
cd ai-desktop-assistant
```

### 3. 安装项目依赖

```bash
pnpm install
```

### 4. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# OpenAI API
VITE_OPENAI_API_KEY=sk-xxx
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Azure TTS (可选)
VITE_AZURE_TTS_KEY=xxx
VITE_AZURE_TTS_REGION=eastasia

# 其他配置
VITE_APP_NAME=AI桌面助手
```

### 5. 启动开发服务器

```bash
pnpm dev
```

---

## 使用 OpenCode 开发

### 初始化项目

在项目根目录创建 `AGENTS.md` 文件，告诉 OpenCode 项目信息：

```markdown
# AI桌面助手 - 开发指南

## 项目信息

- 名称: AI桌面助手
- 技术栈: Tauri 2.0 + React 18 + TypeScript + Rust
- 包管理器: pnpm
- 构建工具: Vite

## 常用命令

- 开发: `pnpm dev`
- 构建: `pnpm build`
- 测试: `pnpm test`
- 代码检查: `pnpm lint`
- 类型检查: `pnpm typecheck`

## 代码规范

- 使用 TypeScript
- 使用函数组件和 Hooks
- 使用 Zustand 进行状态管理
- 组件放在 src/components/
- 页面放在 src/pages/
- Hooks 放在 src/hooks/
- 服务放在 src/services/

## Git 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建配置等
```

### 常用 OpenCode 命令

```bash
# 启动开发服务器
opencode> pnpm dev

# 创建新组件
opencode> 创建一个新的对话组件，包含消息列表和输入框

# 添加功能
opencode> 实现知识库上传功能，支持PDF和Word文档

# 修复问题
opencode> 修复对话历史加载缓慢的问题

# 运行测试
opencode> pnpm test

# 代码检查
opencode> pnpm lint
```

---

## 开发规范

### 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件 | PascalCase | `ChatWindow.tsx` |
| Hooks | camelCase + use前缀 | `useChat.ts` |
| 服务 | camelCase | `aiService.ts` |
| Store | camelCase + Store后缀 | `chatStore.ts` |
| 类型 | PascalCase | `Message` |
| 常量 | UPPER_SNAKE_CASE | `MAX_TOKENS` |
| 文件夹 | camelCase | `components/` |

### 组件结构

```tsx
// 组件文件结构示例
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';

// 类型定义
interface ChatWindowProps {
  conversationId: string;
  onMessageSent?: () => void;
}

// 组件定义
export function ChatWindow({ conversationId, onMessageSent }: ChatWindowProps) {
  // Hooks
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');

  // 副作用
  useEffect(() => {
    // 加载对话
  }, [conversationId]);

  // 事件处理
  const handleSend = async () => {
    // 发送消息
  };

  // 渲染
  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto">
        {/* ... */}
      </div>
      
      {/* 输入框 */}
      <div className="p-4 border-t">
        <InputBar value={input} onChange={setInput} onSend={handleSend} />
      </div>
    </div>
  );
}
```

### 状态管理规范

```typescript
// 使用 Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  
  // Actions
  setCurrentConversation: (id: string | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      
      setCurrentConversation: (id) => {
        const conversation = get().conversations.find(c => c.id === id);
        set({ currentConversation: conversation || null });
      },
      
      addMessage: (message) => {
        set(state => ({
          messages: [...state.messages, message]
        }));
      },
      
      clearMessages: () => {
        set({ messages: [] });
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        // 不持久化 messages
      })
    }
  )
);
```

### Tauri 命令规范

```rust
// Rust 命令定义
#[tauri::command]
async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    // 参数验证
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    
    // 业务逻辑
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    // 数据转换
    let files: Vec<FileItem> = entries
        .filter_map(|entry| entry.ok())
        .map(|entry| FileItem::from(entry))
        .collect();
    
    Ok(files)
}

// TypeScript 调用
import { invoke } from '@tauri-apps/api/tauri';

const files = await invoke<FileItem[]>('list_files', { path: '/home/user' });
```

---

## 功能开发流程

### 1. 开发新功能

**步骤**：

1. 创建类型定义 (`src/types/`)
2. 创建 Store (`src/stores/`)
3. 创建 Service (`src/services/`)
4. 创建 Hook (`src/hooks/`)
5. 创建组件 (`src/components/`)
6. 创建页面 (`src/pages/`)
7. 添加路由
8. 测试

**示例：开发知识库功能**

```bash
# 1. 创建类型
src/types/knowledge.ts

# 2. 创建 Store
src/stores/knowledgeStore.ts

# 3. 创建 Service
src/services/knowledge/index.ts

# 4. 创建 Hook
src/hooks/useKnowledge.ts

# 5. 创建组件
src/components/knowledge/KnowledgeBaseList.tsx
src/components/knowledge/DocumentList.tsx
src/components/knowledge/UploadZone.tsx

# 6. 创建页面
src/pages/Knowledge.tsx

# 7. 添加路由
# 编辑 src/App.tsx
```

### 2. 开发 Rust 后端功能

**步骤**：

1. 定义数据结构 (`src-tauri/src/models/`)
2. 实现命令函数 (`src-tauri/src/commands/`)
3. 注册命令 (`src-tauri/src/lib.rs`)
4. 创建前端调用 (`src/services/api/tauri.ts`)

**示例：添加文件搜索功能**

```rust
// 1. 定义数据结构 (models/file.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub path: String,
    pub name: String,
    pub file_type: String,
    pub size: u64,
    pub modified: u64,
}

// 2. 实现命令 (commands/file.rs)
#[tauri::command]
pub async fn search_files(
    query: String,
    path: String,
    recursive: bool,
) -> Result<Vec<SearchResult>, String> {
    // 实现搜索逻辑
}

// 3. 注册命令 (lib.rs)
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            search_files,
            // 其他命令...
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 测试规范

### 单元测试

```typescript
// tests/unit/chat.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/stores/chatStore';

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      currentConversation: null
    });
  });

  it('should add message', () => {
    const { addMessage, messages } = useChatStore.getState();
    
    addMessage({
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now()
    });
    
    expect(useChatStore.getState().messages).toHaveLength(1);
  });
});
```

### E2E 测试

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('should send message', async ({ page }) => {
  await page.goto('/');
  
  // 等待应用加载
  await page.waitForSelector('[data-testid="chat-input"]');
  
  // 输入消息
  await page.fill('[data-testid="chat-input"]', 'Hello AI');
  await page.click('[data-testid="send-button"]');
  
  // 验证消息发送
  await expect(page.locator('[data-testid="user-message"]')).toContainText('Hello AI');
  
  // 等待AI回复
  await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });
});
```

---

## 构建与发布

### 开发构建

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

### 打包

```bash
# Windows
pnpm tauri build --target x86_64-pc-windows-msvc

# macOS
pnpm tauri build --target x86_64-apple-darwin
pnpm tauri build --target aarch64-apple-darwin
```

### 自动更新

配置 `tauri.conf.json`：

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-domain.com/api/update/{{target}}/{{current_version}}"
      ],
      "pubkey": "your-public-key"
    }
  }
}
```

---

## 调试技巧

### 前端调试

```bash
# 开启 DevTools
pnpm dev

# 在应用中按 F12 或 Ctrl+Shift+I
```

### Rust 调试

```rust
// 使用 println! 或 log
println!("Debug info: {:?}", data);

// 或使用 log crate
use log::{info, debug, error};
info!("Processing file: {}", path);
debug!("File content: {:?}", content);
error!("Failed to read file: {}", err);
```

### Tauri 命令调试

```rust
#[tauri::command]
async fn some_command(param: String) -> Result<ReturnType, String> {
    println!("Received param: {}", param);
    // ...
}
```

---

## 常见问题

### 1. Tauri 命令调用失败

**原因**：命令名称不匹配或参数类型错误

**解决**：
```typescript
// 确保命令名称正确
await invoke('command_name', { paramName: value });

// 检查 Rust 端参数名称
#[tauri::command]
async fn command_name(param_name: String) -> Result<...>
```

### 2. 跨域问题

**原因**：前端直接调用外部 API

**解决**：使用 Tauri 的 HTTP 客户端
```rust
use reqwest;

#[tauri::command]
async fn fetch_data(url: String) -> Result<String, String> {
    let response = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?;
    let text = response.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}
```

### 3. 权限问题

**原因**：缺少系统权限

**解决**：在 `tauri.conf.json` 中配置权限
```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "all": true,
        "scope": ["$HOME/**", "$DOCUMENT/**"]
      },
      "shell": {
        "all": true
      }
    }
  }
}
```