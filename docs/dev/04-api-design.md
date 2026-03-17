# API 设计文档

## 1. Tauri 命令 API

### 1.1 文件操作

#### list_files

列出目录下的文件

**参数**：
```typescript
{
  path: string;  // 目录路径
}
```

**返回**：
```typescript
{
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: number;  // Unix timestamp
}[]
```

**示例**：
```typescript
const files = await invoke<FileItem[]>('list_files', { 
  path: 'C:\\Users\\User\\Documents' 
});
```

---

#### create_folder

创建文件夹

**参数**：
```typescript
{
  path: string;   // 父目录路径
  name: string;   // 文件夹名称
}
```

**返回**：
```typescript
string  // 创建的文件夹完整路径
```

---

#### delete_file

删除文件或文件夹

**参数**：
```typescript
{
  path: string;
}
```

**返回**：
```typescript
void
```

---

#### move_file

移动文件

**参数**：
```typescript
{
  from: string;
  to: string;
}
```

---

#### copy_file

复制文件

**参数**：
```typescript
{
  from: string;
  to: string;
}
```

---

#### search_files

搜索文件

**参数**：
```typescript
{
  query: string;      // 搜索关键词
  path: string;       // 搜索目录
  recursive: boolean; // 是否递归搜索
}
```

**返回**：
```typescript
FileItem[]
```

---

### 1.2 应用操作

#### open_app

打开应用

**参数**：
```typescript
{
  app_name: string;  // 应用名称或路径
}
```

---

#### close_app

关闭应用

**参数**：
```typescript
{
  app_name: string;
}
```

---

#### list_apps

列出已安装应用

**返回**：
```typescript
{
  name: string;
  path: string;
  icon?: string;
}[]
```

---

### 1.3 浏览器操作

#### open_url

打开网页

**参数**：
```typescript
{
  url: string;
}
```

---

#### screenshot

截图

**参数**：
```typescript
{
  type: 'fullscreen' | 'region' | 'window';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
```

**返回**：
```typescript
string  // base64 encoded image
```

---

### 1.4 知识库操作

#### create_knowledge_base

创建知识库

**参数**：
```typescript
{
  name: string;
  description?: string;
}
```

**返回**：
```typescript
{
  id: string;
  name: string;
  description?: string;
  created_at: number;
  updated_at: number;
  document_count: number;
  chunk_count: number;
}
```

---

#### upload_document

上传文档

**参数**：
```typescript
{
  kb_id: string;
  file_path: string;
}
```

**返回**：
```typescript
{
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: number;
  error?: string;
}
```

---

#### search_knowledge

搜索知识库

**参数**：
```typescript
{
  kb_id: string;
  query: string;
  top_k?: number;  // 默认 5
}
```

**返回**：
```typescript
{
  content: string;
  score: number;
  metadata: {
    documentId: string;
    filename: string;
    page?: number;
  };
}[]
```

---

### 1.5 微信操作

#### wechat_connect

连接微信

**返回**：
```typescript
void
```

---

#### wechat_send_message

发送微信消息

**参数**：
```typescript
{
  contact_name: string;
  message: string;
}
```

---

#### wechat_start_call

发起通话

**参数**：
```typescript
{
  contact_name: string;
  call_type: 'audio' | 'video';
}
```

---

### 1.6 系统操作

#### get_system_info

获取系统信息

**返回**：
```typescript
{
  os: string;
  version: string;
  hostname: string;
  cpu: string;
  memory: number;
  disk: number;
}
```

---

#### get_clipboard

获取剪贴板内容

**返回**：
```typescript
{
  type: 'text' | 'image' | 'files';
  content: string | string[];
}
```

---

#### set_clipboard

设置剪贴板内容

**参数**：
```typescript
{
  type: 'text' | 'image' | 'files';
  content: string | string[];
}
```

---

## 2. 前端服务 API

### 2.1 AI 服务

#### chat

发送对话消息

```typescript
interface AIService {
  chat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string>;
  
  chatStream(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): AsyncGenerator<string>;
  
  embed(
    text: string
  ): Promise<number[]>;
}
```

---

### 2.2 语音服务

```typescript
interface VoiceService {
  // 语音识别
  recognize(audio: Blob): Promise<string>;
  
  // 开始录音
  startRecording(): void;
  
  // 停止录音
  stopRecording(): Promise<Blob>;
  
  // 语音合成
  synthesize(text: string, options?: {
    voiceId?: string;
    speed?: number;
    pitch?: number;
  }): Promise<Blob>;
  
  // 播放
  speak(text: string): Promise<void>;
}
```

---

### 2.3 知识库服务

```typescript
interface KnowledgeService {
  // 知识库管理
  createKB(name: string, description?: string): Promise<KnowledgeBase>;
  deleteKB(id: string): Promise<void>;
  listKB(): Promise<KnowledgeBase[]>;
  
  // 文档管理
  uploadDocument(kbId: string, file: File): Promise<Document>;
  deleteDocument(kbId: string, docId: string): Promise<void>;
  listDocuments(kbId: string): Promise<Document[]>;
  
  // 检索
  search(kbId: string, query: string, topK?: number): Promise<RetrievedChunk[]>;
  
  // 网页抓取
  crawlUrl(kbId: string, url: string): Promise<Document>;
}
```

---

## 3. 事件 API

### 3.1 Tauri 事件

```typescript
import { listen } from '@tauri-apps/api/event';

// 监听文件变化
listen('file-changed', (event) => {
  console.log('File changed:', event.payload);
});

// 监听微信消息
listen('wechat-message', (event) => {
  console.log('WeChat message:', event.payload);
});

// 监听系统通知
listen('system-notification', (event) => {
  console.log('System notification:', event.payload);
});
```

### 3.2 自定义事件

| 事件名 | 触发时机 | 载荷 |
|-------|---------|------|
| `conversation-updated` | 对话更新 | Conversation |
| `knowledge-base-updated` | 知识库更新 | KnowledgeBase |
| `document-processed` | 文档处理完成 | Document |
| `avatar-speaking` | 形象开始说话 | void |
| `avatar-idle` | 形象变为空闲 | void |

---

## 4. 存储 API

### 4.1 本地存储

```typescript
// 使用 Zustand 持久化
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // state and actions
    }),
    {
      name: 'storage-key',
    }
  )
);
```

### 4.2 文件存储

```typescript
import { appDataDir, join } from '@tauri-apps/api/path';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

// 保存数据
async function saveData(key: string, data: string) {
  const dir = await appDataDir();
  const path = await join(dir, `${key}.json`);
  await writeTextFile(path, data);
}

// 读取数据
async function loadData(key: string): Promise<string | null> {
  const dir = await appDataDir();
  const path = await join(dir, `${key}.json`);
  try {
    return await readTextFile(path);
  } catch {
    return null;
  }
}
```

---

## 5. 错误处理

### 5.1 错误类型

```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN = 'UNKNOWN',
  INVALID_PARAM = 'INVALID_PARAM',
  
  // 文件错误
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // AI 错误
  AI_API_ERROR = 'AI_API_ERROR',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
  
  // 微信错误
  WECHAT_NOT_RUNNING = 'WECHAT_NOT_RUNNING',
  WECHAT_CONTACT_NOT_FOUND = 'WECHAT_CONTACT_NOT_FOUND',
  
  // 知识库错误
  KB_NOT_FOUND = 'KB_NOT_FOUND',
  DOCUMENT_PROCESS_ERROR = 'DOCUMENT_PROCESS_ERROR',
}

interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
}
```

### 5.2 错误处理示例

```typescript
import { invoke } from '@tauri-apps/api/tauri';

async function safeInvoke<T>(cmd: string, args: Record<string, any>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    const appError: AppError = {
      code: ErrorCode.UNKNOWN,
      message: String(error),
    };
    
    if (typeof error === 'string') {
      // 解析错误信息
      if (error.includes('not found')) {
        appError.code = ErrorCode.FILE_NOT_FOUND;
      } else if (error.includes('permission')) {
        appError.code = ErrorCode.PERMISSION_DENIED;
      }
    }
    
    throw appError;
  }
}
```