---
name: tauri-desktop-app
description: AI桌面助手开发技能 - 用于Tauri + React + Rust桌面应用开发，包含电脑操作、知识库、微信互联等模块
---

# Tauri Desktop App Development

## 项目概述

AI桌面助手 - 全能型AI生活助手

**技术栈**：
- 前端：React 18 + TypeScript + Zustand + Tailwind CSS
- 后端：Tauri 2.0 + Rust
- UI组件：Shadcn/ui

## 开发规范

### 前端规范

1. **组件开发**
   - 使用函数组件 + Hooks
   - 组件放在 `src/components/` 目录
   - 页面放在 `src/pages/` 目录
   - 使用 TypeScript 严格模式

2. **状态管理**
   - 使用 Zustand 进行状态管理
   - Store 放在 `src/stores/` 目录
   - 使用 persist 中间件持久化

3. **样式规范**
   - 使用 Tailwind CSS
   - 遵循 Shadcn/ui 组件规范
   - 支持深色模式

### Tauri/Rust 规范

1. **命令定义**
```rust
#[tauri::command]
async fn command_name(param: String) -> Result<ReturnType, String> {
    // 参数验证
    // 业务逻辑
    // 返回结果
}
```

2. **错误处理**
   - 所有错误转为 String 返回
   - 使用 `map_err(|e| e.to_string())`

3. **文件操作**
   - 使用 tokio::fs 异步操作
   - 验证路径权限

## 核心模块

### 1. 智能对话模块
- 文件：`src/components/chat/`, `src/hooks/useChat.ts`
- Store：`src/stores/chatStore.ts`
- 服务：`src/services/ai/`

### 2. 知识库模块
- 文件：`src/components/knowledge/`, `src/hooks/useKnowledge.ts`
- Rust：`src-tauri/src/commands/knowledge.rs`
- 向量库：ChromaDB

### 3. 电脑操控模块
- 文件：`src/components/control/`
- Rust：`src-tauri/src/commands/file.rs`, `app.rs`, `browser.rs`

### 4. 微信互联模块
- 文件：`src/components/wechat/`
- Rust：`src-tauri/src/commands/wechat.rs`

### 5. 形象声音模块
- 文件：`src/components/avatar/`
- 技术：Live2D, Edge TTS

## 常用命令

```bash
# 开发
pnpm dev
pnpm tauri dev

# 构建
pnpm build
pnpm tauri build

# 测试
pnpm test
pnpm lint
pnpm typecheck
```

## 相关 Skills

开发时配合使用以下 skills：

- `senior-frontend`: React 组件开发
- `frontend-design`: UI 设计实现
- `frontend-testing`: 单元测试
- `frontend-patterns`: 设计模式
- `frontend-code-review`: 代码审查