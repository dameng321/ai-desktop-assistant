# 模块开发文档

## 1. 智能对话模块

### 1.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatWindow 组件                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MessageList │  │  InputBar   │  │ VoiceInput  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      useChat Hook                            │
├─────────────────────────────────────────────────────────────┤
│                      chatStore (Zustand)                     │
├─────────────────────────────────────────────────────────────┤
│                      AIService                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  OpenAI API │  │  Ollama API │  │  其他模型    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心代码

#### 类型定义 (types/chat.ts)

```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  retrievalChunks?: RetrievedChunk[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  knowledgeBaseId?: string;
}
```

#### Store (stores/chatStore.ts)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Conversation, Message, ConversationSettings } from '@/types/chat';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ConversationSettings;
  
  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateSettings: (settings: Partial<ConversationSettings>) => void;
  clearAll: () => void;
}

const defaultSettings: ConversationSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: '你是一个友好的AI助手。',
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      
      createConversation: () => {
        const id = crypto.randomUUID();
        const conversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: 'gpt-4-turbo-preview',
          settings: { ...get().settings },
        };
        
        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },
      
      deleteConversation: (id) => {
        set(state => {
          const conversations = state.conversations.filter(c => c.id !== id);
          const currentConversationId = state.currentConversationId === id
            ? conversations[0]?.id || null
            : state.currentConversationId;
          
          return { conversations, currentConversationId };
        });
      },
      
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            const messages = [...c.messages, message];
            const title = c.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
              : c.title;
            
            return {
              ...c,
              messages,
              title,
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      updateMessage: (conversationId, messageId, content) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      deleteMessage: (conversationId, messageId) => {
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c;
            
            return {
              ...c,
              messages: c.messages.filter(m => m.id !== messageId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      updateSettings: (settings) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      clearAll: () => {
        set({
          conversations: [],
          currentConversationId: null,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

#### Hook (hooks/useChat.ts)

```typescript
import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { aiService } from '@/services/ai';
import type { Message } from '@/types/chat';

export function useChat() {
  const {
    conversations,
    currentConversationId,
    settings,
    createConversation,
    addMessage,
    updateMessage,
  } = useChatStore();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  const sendMessage = useCallback(async (content: string) => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = createConversation();
    }
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    addMessage(conversationId, userMessage);
    
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    
    addMessage(conversationId, assistantMessage);
    
    try {
      abortControllerRef.current = new AbortController();
      
      const messages = currentConversation?.messages || [];
      const apiMessages = [
        { role: 'system', content: settings.systemPrompt || '' },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content },
      ];
      
      let fullContent = '';
      
      for await (const chunk of aiService.chatStream(apiMessages, {
        model: currentConversation?.model || 'gpt-4-turbo-preview',
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        signal: abortControllerRef.current.signal,
      })) {
        fullContent += chunk;
        updateMessage(conversationId, assistantMessageId, fullContent);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      updateMessage(
        conversationId,
        assistantMessageId,
        `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }, [currentConversationId, currentConversation, settings, createConversation, addMessage, updateMessage]);
  
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);
  
  return {
    conversation: currentConversation,
    sendMessage,
    stopGeneration,
    isLoading: false,
  };
}
```

#### 组件 (components/chat/ChatWindow.tsx)

```tsx
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { VoiceInput } from './VoiceInput';

export function ChatWindow() {
  const { conversation, sendMessage, stopGeneration } = useChat();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const content = input.trim();
    setInput('');
    await sendMessage(content);
  };
  
  const handleVoiceInput = async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript.trim());
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <MessageList messages={conversation?.messages || []} />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <InputBar
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onStop={stopGeneration}
              placeholder="输入消息..."
            />
          </div>
          <VoiceInput
            onResult={handleVoiceInput}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 2. 知识库模块

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    KnowledgeBaseList 组件                    │
├─────────────────────────────────────────────────────────────┤
│                      useKnowledge Hook                       │
├─────────────────────────────────────────────────────────────┤
│                    knowledgeStore (Zustand)                  │
├─────────────────────────────────────────────────────────────┤
│                    KnowledgeService                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Document    │  │  Embedding  │  │  Vector DB  │         │
│  │ Parser      │  │  Service    │  │ (ChromaDB)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心代码

#### 类型定义 (types/knowledge.ts)

```typescript
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  documents: Document[];
  stats: KnowledgeBaseStats;
}

export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  createdAt: number;
  error?: string;
}

export interface KnowledgeBaseStats {
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}

export interface RetrievedChunk {
  content: string;
  score: number;
  metadata: {
    documentId: string;
    filename: string;
    page?: number;
  };
}
```

#### Service (services/knowledge/index.ts)

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import type { KnowledgeBase, Document, RetrievedChunk } from '@/types/knowledge';

export const knowledgeService = {
  async createKnowledgeBase(name: string, description?: string): Promise<KnowledgeBase> {
    return invoke<KnowledgeBase>('create_knowledge_base', { name, description });
  },
  
  async deleteKnowledgeBase(id: string): Promise<void> {
    return invoke('delete_knowledge_base', { id });
  },
  
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return invoke<KnowledgeBase[]>('list_knowledge_bases');
  },
  
  async uploadDocument(kbId: string, filePath: string): Promise<Document> {
    return invoke<Document>('upload_document', { kbId, filePath });
  },
  
  async deleteDocument(kbId: string, docId: string): Promise<void> {
    return invoke('delete_document', { kbId, docId });
  },
  
  async search(kbId: string, query: string, topK: number = 5): Promise<RetrievedChunk[]> {
    return invoke<RetrievedChunk[]>('search_knowledge', { kbId, query, topK });
  },
  
  async getDocumentStatus(kbId: string, docId: string): Promise<Document> {
    return invoke<Document>('get_document_status', { kbId, docId });
  },
};
```

#### Rust 后端 (src-tauri/src/commands/knowledge.rs)

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBase {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub document_count: usize,
    pub chunk_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub filename: String,
    pub file_type: String,
    pub file_size: u64,
    pub status: String,
    pub created_at: u64,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn create_knowledge_base(
    name: String,
    description: Option<String>,
) -> Result<KnowledgeBase, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp() as u64;
    
    let kb = KnowledgeBase {
        id,
        name,
        description,
        created_at: now,
        updated_at: now,
        document_count: 0,
        chunk_count: 0,
    };
    
    // 存储到数据库
    save_knowledge_base(&kb).await?;
    
    Ok(kb)
}

#[tauri::command]
pub async fn upload_document(
    kb_id: String,
    file_path: String,
) -> Result<Document, String> {
    let path = PathBuf::from(&file_path);
    let filename = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    
    let file_type = path
        .extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_default();
    
    let metadata = fs::metadata(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let doc = Document {
        id: uuid::Uuid::new_v4().to_string(),
        filename,
        file_type,
        file_size: metadata.len(),
        status: "processing".to_string(),
        created_at: chrono::Utc::now().timestamp() as u64,
        error: None,
    };
    
    // 异步处理文档
    process_document(kb_id.clone(), doc.id.clone(), path).await?;
    
    Ok(doc)
}

async fn process_document(
    kb_id: String,
    doc_id: String,
    file_path: PathBuf,
) -> Result<(), String> {
    // 1. 解析文档
    let content = parse_document(&file_path).await?;
    
    // 2. 分块
    let chunks = split_into_chunks(&content, 500, 50);
    
    // 3. 向量化
    let embeddings = generate_embeddings(&chunks).await?;
    
    // 4. 存储
    store_embeddings(&kb_id, &doc_id, &chunks, &embeddings).await?;
    
    Ok(())
}

async fn parse_document(path: &PathBuf) -> Result<String, String> {
    let extension = path
        .extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_default();
    
    match extension.as_str() {
        "txt" | "md" => {
            fs::read_to_string(path)
                .await
                .map_err(|e| format!("Failed to read file: {}", e))
        }
        "pdf" => {
            // 使用 pdf-extract 库
            let bytes = fs::read(path)
                .await
                .map_err(|e| format!("Failed to read PDF: {}", e))?;
            pdf_extract::extract_text_from_mem(&bytes)
                .map_err(|e| format!("Failed to extract PDF text: {}", e))
        }
        _ => Err(format!("Unsupported file type: {}", extension)),
    }
}

fn split_into_chunks(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut chunks = Vec::new();
    
    let mut start = 0;
    while start < words.len() {
        let end = (start + chunk_size).min(words.len());
        let chunk = words[start..end].join(" ");
        chunks.push(chunk);
        
        start += chunk_size - overlap;
    }
    
    chunks
}
```

---

## 3. 电脑操控模块

### 3.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    ControlPanel 组件                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ FileManager │  │ AppLauncher │  │BrowserCtrl  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      useControl Hook                         │
├─────────────────────────────────────────────────────────────┤
│                      controlStore                            │
├─────────────────────────────────────────────────────────────┤
│                    Tauri Commands (Rust)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  File Ops   │  │  App Ops    │  │Window Ops   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心代码

#### Rust 文件操作 (src-tauri/src/commands/file.rs)

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
}

#[tauri::command]
pub async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        
        files.push(FileItem {
            name: entry.file_name().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified: metadata
                .modified()
                .map(|t| {
                    t.duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_secs())
                        .unwrap_or(0)
                })
                .unwrap_or(0),
        });
    }
    
    Ok(files)
}

#[tauri::command]
pub async fn create_folder(path: String, name: String) -> Result<String, String> {
    let full_path = PathBuf::from(&path).join(&name);
    
    fs::create_dir(&full_path)
        .map_err(|e| format!("Failed to create folder: {}", e))?;
    
    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let path = PathBuf::from(&path);
    
    if path.is_dir() {
        fs::remove_dir_all(&path)
            .map_err(|e| format!("Failed to delete folder: {}", e))?;
    } else {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to delete file: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn move_file(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to)
        .map_err(|e| format!("Failed to move file: {}", e))
}

#[tauri::command]
pub async fn copy_file(from: String, to: String) -> Result<(), String> {
    fs::copy(&from, &to)
        .map_err(|e| format!("Failed to copy file: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn search_files(
    query: String,
    path: String,
    recursive: bool,
) -> Result<Vec<FileItem>, String> {
    let mut results = Vec::new();
    let pattern = format!("*{}*", query);
    
    fn search_dir(
        dir: &PathBuf,
        pattern: &str,
        results: &mut Vec<FileItem>,
        recursive: bool,
    ) -> Result<(), String> {
        let entries = fs::read_dir(dir)
            .map_err(|e| format!("Failed to read directory: {}", e))?;
        
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            
            if glob_match::glob_match(pattern, &name) {
                let metadata = fs::metadata(&path)
                    .map_err(|e| format!("Failed to read metadata: {}", e))?;
                
                results.push(FileItem {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_dir: metadata.is_dir(),
                    size: metadata.len(),
                    modified: metadata
                        .modified()
                        .map(|t| {
                            t.duration_since(std::time::UNIX_EPOCH)
                                .map(|d| d.as_secs())
                                .unwrap_or(0)
                        })
                        .unwrap_or(0),
                });
            }
            
            if recursive && path.is_dir() {
                search_dir(&path, pattern, results, recursive)?;
            }
        }
        
        Ok(())
    }
    
    search_dir(&PathBuf::from(&path), &pattern, &mut results, recursive)?;
    
    Ok(results)
}
```

#### Rust 应用操作 (src-tauri/src/commands/app.rs)

```rust
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub path: String,
    pub icon: Option<String>,
}

#[tauri::command]
pub async fn open_app(app_name: String) -> Result<(), String> {
    let app_path = find_app_path(&app_name)?;
    
    Command::new(&app_path)
        .spawn()
        .map_err(|e| format!("Failed to open app: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn close_app(app_name: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("taskkill")
            .args(["/IM", &app_name, "/F"])
            .spawn()
            .map_err(|e| format!("Failed to close app: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn list_apps() -> Result<Vec<AppInfo>, String> {
    let mut apps = Vec::new();
    
    #[cfg(target_os = "windows")]
    {
        let start_menu = dirs::data_local_dir()
            .map(|p| p.join("Microsoft/Windows/Start Menu/Programs"))
            .unwrap();
        
        if let Ok(entries) = std::fs::read_dir(start_menu) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().map(|e| e == "lnk").unwrap_or(false) {
                    let name = path
                        .file_stem()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    
                    apps.push(AppInfo {
                        name,
                        path: path.to_string_lossy().to_string(),
                        icon: None,
                    });
                }
            }
        }
    }
    
    Ok(apps)
}

fn find_app_path(app_name: &str) -> Result<String, String> {
    let apps = futures::executor::block_on(list_apps())?;
    
    apps.iter()
        .find(|a| a.name.to_lowercase().contains(&app_name.to_lowercase()))
        .map(|a| a.path.clone())
        .ok_or_else(|| format!("App not found: {}", app_name))
}
```

---

## 4. 微信互联模块

### 4.1 核心代码

#### Rust 微信操作 (src-tauri/src/commands/wechat.rs)

```rust
use serde::{Deserialize, Serialize};
use std::thread;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WechatContact {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
}

#[tauri::command]
pub async fn wechat_connect() -> Result<(), String> {
    let wechat_running = is_wechat_running()?;
    
    if !wechat_running {
        open_wechat()?;
        thread::sleep(Duration::from_secs(3));
    }
    
    Ok(())
}

#[tauri::command]
pub async fn wechat_send_message(
    contact_name: String,
    message: String,
) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::Input::KeyboardAndMouse::*;
        use windows::Win32::UI::WindowsAndMessaging::*;
        
        let hwnd = find_wechat_window()?;
        
        SetForegroundWindow(hwnd);
        thread::sleep(Duration::from_millis(100));
        
        keybd_event(VK_CONTROL.0 as u8, 0, KEYEVENTF_EXTENDEDKEY, 0);
        keybd_event(0x46, 0, KEYEVENTF_EXTENDEDKEY, 0);
        keybd_event(0x46, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL.0 as u8, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
        
        thread::sleep(Duration::from_millis(100));
        
        type_text(&contact_name)?;
        thread::sleep(Duration::from_millis(100));
        keybd_event(VK_RETURN.0 as u8, 0, 0, 0);
        keybd_event(VK_RETURN.0 as u8, 0, KEYEVENTF_KEYUP, 0);
        
        thread::sleep(Duration::from_millis(200));
        
        type_text(&message)?;
        thread::sleep(Duration::from_millis(100));
        keybd_event(VK_RETURN.0 as u8, 0, 0, 0);
        keybd_event(VK_RETURN.0 as u8, 0, KEYEVENTF_KEYUP, 0);
    }
    
    Ok(())
}

#[tauri::command]
pub async fn wechat_start_call(
    contact_name: String,
    call_type: String,
) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hwnd = find_wechat_window()?;
        SetForegroundWindow(hwnd);
        thread::sleep(Duration::from_millis(100));
        
        keybd_event(VK_CONTROL.0 as u8, 0, KEYEVENTF_EXTENDEDKEY, 0);
        keybd_event(0x46, 0, KEYEVENTF_EXTENDEDKEY, 0);
        keybd_event(0x46, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL.0 as u8, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
        
        thread::sleep(Duration::from_millis(100));
        type_text(&contact_name)?;
        thread::sleep(Duration::from_millis(100));
        keybd_event(VK_RETURN.0 as u8, 0, 0, 0);
        keybd_event(VK_RETURN.0 as u8, 0, KEYEVENTF_KEYUP, 0);
        
        thread::sleep(Duration::from_millis(500));
        
        if call_type == "video" {
            // 点击视频通话按钮
            click_at_position(hwnd, 800, 150)?;
        } else {
            // 点击语音通话按钮
            click_at_position(hwnd, 700, 150)?;
        }
    }
    
    Ok(())
}

#[cfg(target_os = "windows")]
fn is_wechat_running() -> Result<bool, String> {
    use windows::Win32::System::Threading::*;
    use windows::Win32::UI::WindowsAndMessaging::*;
    
    let hwnd = FindWindowW(
        windows::core::w!("WeChatMainWndForPC"),
        windows::core::w!(""),
    );
    
    Ok(hwnd.0 != 0)
}

#[cfg(target_os = "windows")]
fn find_wechat_window() -> Result<windows::Win32::Foundation::HWND, String> {
    use windows::Win32::UI::WindowsAndMessaging::*;
    
    let hwnd = FindWindowW(
        windows::core::w!("WeChatMainWndForPC"),
        windows::core::w!(""),
    );
    
    if hwnd.0 == 0 {
        return Err("WeChat window not found".to_string());
    }
    
    Ok(hwnd)
}

#[cfg(target_os = "windows")]
fn type_text(text: &str) -> Result<(), String> {
    use windows::Win32::UI::Input::KeyboardAndMouse::*;
    
    for c in text.chars() {
        let vk = VkKeyScanW(c as u16);
        let scan = MapVirtualKeyW((vk & 0xFF) as u32, MAPVK_VK_TO_VSC);
        
        keybd_event((vk & 0xFF) as u8, scan as u8, 0, 0);
        keybd_event((vk & 0xFF) as u8, scan as u8, KEYEVENTF_KEYUP, 0);
    }
    
    Ok(())
}

#[cfg(target_os = "windows")]
fn click_at_position(hwnd: windows::Win32::Foundation::HWND, x: i32, y: i32) -> Result<(), String> {
    use windows::Win32::UI::Input::KeyboardAndMouse::*;
    
    let mut point = windows::Win32::Foundation::POINT { x, y };
    ClientToScreen(hwnd, &mut point);
    
    SetCursorPos(point.x, point.y);
    thread::sleep(Duration::from_millis(50));
    
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    thread::sleep(Duration::from_millis(50));
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    
    Ok(())
}
```

---

## 5. 形象声音模块

### 5.1 前端实现

```tsx
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

interface AvatarDisplayProps {
  type: 'static' | 'live2d' | 'realistic';
  modelId: string;
  speaking: boolean;
  emotion: string;
}

export function AvatarDisplay({ type, modelId, speaking, emotion }: AvatarDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<Live2DModel | null>(null);
  
  useEffect(() => {
    if (type !== 'live2d' || !containerRef.current) return;
    
    const app = new PIXI.Application({
      view: undefined,
      width: 300,
      height: 400,
      transparent: true,
    });
    
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    
    Live2DModel.from(`/models/${modelId}.model.json`).then(live2dModel => {
      app.stage.addChild(live2dModel);
      
      live2dModel.scale.set(0.3);
      live2dModel.anchor.set(0.5, 0.5);
      live2dModel.x = app.screen.width / 2;
      live2dModel.y = app.screen.height / 2;
      
      setModel(live2dModel);
    });
    
    return () => {
      app.destroy(true);
    };
  }, [type, modelId]);
  
  useEffect(() => {
    if (!model) return;
    
    if (speaking) {
      model.motion('speak');
    } else {
      model.motion('idle');
    }
    
    if (emotion) {
      model.expression(emotion);
    }
  }, [model, speaking, emotion]);
  
  if (type === 'static') {
    return (
      <div className="relative w-full h-full">
        <img
          src={`/avatars/${modelId}.png`}
          alt="Avatar"
          className={speaking ? 'animate-pulse' : ''}
        />
      </div>
    );
  }
  
  return <div ref={containerRef} className="w-full h-full" />;
}
```

### 5.2 语音合成

```typescript
import { edgeTTS } from 'edge-tts';

export class VoiceService {
  private voiceId: string;
  
  constructor(voiceId: string = 'zh-CN-XiaoxiaoNeural') {
    this.voiceId = voiceId;
  }
  
  async synthesize(text: string): Promise<ArrayBuffer> {
    const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: this.buildSSML(text),
    });
    
    return response.arrayBuffer();
  }
  
  private buildSSML(text: string): string {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="${this.voiceId}">
          ${text}
        </voice>
      </speak>
    `;
  }
  
  async speak(text: string): Promise<void> {
    const audioBuffer = await this.synthesize(text);
    const audioContext = new AudioContext();
    const audioBuffer decoded = await audioContext.decodeAudioData(audioBuffer);
    
    const source = audioContext.createBufferSource();
    source.buffer = decoded;
    source.connect(audioContext.destination);
    source.start();
  }
}
```