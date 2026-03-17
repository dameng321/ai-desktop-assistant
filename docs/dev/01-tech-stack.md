# 技术栈选型

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  React 18   │ │  Shadcn/ui  │ │  Tailwind   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      状态管理层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Zustand   │ │ React Query │ │  WebSocket  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      业务逻辑层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  AI对话服务  │ │ 知识库服务   │ │ 电脑操控服务 │          │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤          │
│  │  语音服务    │ │  微信服务    │ │  形象服务    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      桥接层 (Tauri IPC)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TypeScript ↔ Rust 通信                 │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      系统服务层 (Rust)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   文件系统   │ │   进程管理   │ │   窗口管理   │          │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤          │
│  │   网络请求   │ │   数据存储   │ │   系统托盘   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      操作系统 API                            │
│                    Windows 10/11 APIs                       │
└─────────────────────────────────────────────────────────────┘
```

## 技术选型详细说明

### 1. 桌面框架：Tauri 2.0

**选型理由**：
- 相比Electron，打包体积小（<10MB vs >100MB）
- 内存占用低（约50MB vs >300MB）
- Rust后端性能优秀
- 原生系统集成更好
- 安全性更高

**主要特性**：
- Web前端 + Rust后端
- 原生窗口管理
- 系统托盘
- 自动更新
- 多窗口支持

### 2. 前端框架：React 18 + TypeScript

**选型理由**：
- 生态成熟，组件丰富
- TypeScript类型安全
- Hooks开发效率高
- 社区活跃

**主要依赖**：
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x",
  "typescript": "^5.x"
}
```

### 3. UI组件库：Shadcn/ui + Tailwind CSS

**选型理由**：
- Shadcn/ui：高质量、可定制、无依赖
- Tailwind CSS：原子化CSS，开发效率高
- 支持深色模式
- 组件复制粘贴，完全可控

**主要依赖**：
```json
{
  "tailwindcss": "^3.x",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

### 4. 状态管理：Zustand

**选型理由**：
- 轻量级（<1KB）
- API简单直观
- TypeScript支持好
- 无需Provider包裹
- 支持持久化

**使用示例**：
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  conversations: Conversation[];
  settings: UserSettings;
  addConversation: (conv: Conversation) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      conversations: [],
      settings: defaultSettings,
      addConversation: (conv) => set((state) => ({
        conversations: [...state.conversations, conv]
      })),
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      }))
    }),
    { name: 'app-storage' }
  )
);
```

### 5. AI对话服务

#### 5.1 OpenAI API

**用途**：主要AI模型
**备选**：Anthropic Claude、阿里通义千问

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  dangerouslyAllowBrowser: true
});

// 流式对话
const stream = await client.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: messages,
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  yield content;
}
```

#### 5.2 Ollama（本地模型）

**用途**：离线对话、隐私保护

```typescript
// 通过HTTP调用本地Ollama
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3',
    messages: messages,
    stream: true
  })
});
```

### 6. 知识库：LangChain + ChromaDB

**技术栈**：
- LangChain.js：RAG框架
- ChromaDB：向量数据库（本地）
- OpenAI Embeddings：文本向量化

```typescript
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';

// 初始化向量库
const client = new ChromaClient();
const embeddings = new OpenAIEmbeddings();

// 创建集合
const collection = await client.createCollection({
  name: 'knowledge-base',
  embeddingFunction: embeddings
});

// 添加文档
await collection.add({
  ids: ['doc1'],
  documents: ['文档内容...'],
  metadatas: [{ source: 'file.pdf' }]
});

// 检索
const results = await collection.query({
  queryTexts: ['用户问题'],
  nResults: 5
});
```

### 7. 语音服务

#### 7.1 语音识别 (STT)

**方案**：Whisper API（在线） / Whisper.cpp（本地）

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

// 语音转文字
const transcription = await client.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'zh'
});
```

#### 7.2 语音合成 (TTS)

**方案对比**：
| 方案 | 质量 | 成本 | 延迟 |
|-----|------|------|------|
| Edge TTS | 中 | 免费 | 低 |
| Azure TTS | 高 | 中 | 低 |
| 讯飞语音 | 高 | 中 | 低 |
| GPT-SoVITS | 高 | 免费 | 中 |

**推荐**：Edge TTS（免费）+ Azure TTS（付费）

```typescript
// Edge TTS
import { Synthesizer } from 'edge-tts';

const synth = new Synthesizer();
synth.setVoice('zh-CN-XiaoxiaoNeural');
const audio = await synth.synthesize('你好，我是AI助手');
```

### 8. 数字人形象

#### 8.1 静态头像

**技术**：CSS动画 + 多状态图片

```typescript
const AvatarStates = {
  idle: '/avatars/default.png',
  speaking: '/avatars/speaking.gif',
  thinking: '/avatars/thinking.gif',
  happy: '/avatars/happy.png'
};
```

#### 8.2 虚拟数字人 (Live2D)

**技术**：Live2D Cubism SDK

```typescript
import { Live2D } from 'pixi-live2d-display';

// 加载模型
const model = await Live2D.from('model.json');

// 设置表情
model.expression('happy');

// 设置动作
model.motion('idle');

// 口型同步
model.speak(audioBuffer, text);
```

#### 8.3 真人数字分身

**技术方案**：
- HeyGen API（推荐）
- D-ID API
- SadTalker（开源本地）

```typescript
// HeyGen API
const response = await fetch('https://api.heygen.com/v2/video/generate', {
  method: 'POST',
  headers: {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    video_inputs: [{
      character: { avatar_id: 'avatar-001' },
      script: {
        type: 'text',
        input: '你好，我是AI助手',
        provider: { type: 'microsoft', voice_id: 'zh-CN-XiaoxiaoNeural' }
      }
    }]
  })
});
```

### 9. 电脑操控服务

#### 9.1 文件操作

**技术**：Rust + Tauri Commands

```rust
#[tauri::command]
async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        
        files.push(FileItem {
            name: entry.file_name().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified: metadata.modified()
                .map(|t| t.duration_since(UNIX_EPOCH)
                    .map(|d| d.as_secs())
                    .unwrap_or(0))
                .unwrap_or(0)
        });
    }
    
    Ok(files)
}

#[tauri::command]
async fn move_file(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to).map_err(|e| e.to_string())
}
```

#### 9.2 应用启动

**技术**：Rust + Windows API

```rust
use std::process::Command;

#[tauri::command]
async fn open_app(app_name: String) -> Result<(), String> {
    // 从注册表或开始菜单查找应用路径
    let app_path = find_app_path(&app_name)?;
    
    Command::new(&app_path)
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

#### 9.3 浏览器控制

**技术**：Playwright（Rust版本）

```rust
use playwright::Playwright;

#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    let playwright = Playwright::initialize().await?;
    let browser = playwright.chromium().launch().await?;
    let page = browser.new_page().await?;
    
    page.goto(&url).await?;
    
    Ok(())
}
```

#### 9.4 屏幕控制

**技术**：Rust + Windows API / RobotJS

```rust
use windows::Win32::UI::Input::KeyboardAndMouse::*;

#[tauri::command]
async fn simulate_click(x: i32, y: i32) -> Result<(), String> {
    // 移动鼠标
    SetCursorPos(x, y);
    
    // 模拟点击
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    
    Ok(())
}
```

### 10. 微信自动化

**技术**：UI Automation (Rust)

```rust
use windows::Win32::UI::Accessibility::*;

#[tauri::command]
async fn wechat_send_message(contact: String, message: String) -> Result<(), String> {
    // 获取微信窗口
    let wechat_window = find_window("微信")?;
    
    // 搜索联系人
    click_search(wechat_window)?;
    type_text(&contact)?;
    press_enter()?;
    
    // 输入消息
    type_text(&message)?;
    press_enter()?;
    
    Ok(())
}
```

### 11. 数据存储

#### 11.1 SQLite

**用途**：对话历史、知识库元数据

```sql
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    role TEXT,
    content TEXT,
    timestamp INTEGER,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE TABLE knowledge_bases (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at INTEGER
);

CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    kb_id TEXT,
    filename TEXT,
    status TEXT,
    created_at INTEGER,
    FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id)
);
```

#### 11.2 LevelDB

**用途**：键值存储、缓存

```typescript
import { Level } from 'level';

const db = new Level('./data', { valueEncoding: 'json' });

// 存储
await db.put('user:settings', settings);

// 读取
const settings = await db.get('user:settings');

// 批量操作
await db.batch([
  { type: 'put', key: 'key1', value: 'value1' },
  { type: 'put', key: 'key2', value: 'value2' }
]);
```

### 12. 开发工具

| 工具 | 用途 |
|-----|------|
| OpenCode | AI辅助开发 |
| VSCode | 代码编辑 |
| pnpm | 包管理 |
| Vite | 前端构建 |
| Cargo | Rust包管理 |
| Tauri CLI | 桌面应用构建 |

### 13. 测试工具

| 工具 | 用途 |
|-----|------|
| Vitest | 单元测试 |
| Playwright | E2E测试 |
| MSW | API Mock |

### 14. 监控与日志

| 工具 | 用途 |
|-----|------|
| log4rs | Rust日志 |
| tracing | 性能追踪 |
| sentry | 错误监控（可选） |