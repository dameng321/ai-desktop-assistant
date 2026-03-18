# AI 桌面助手

一款基于 Tauri 2.0 的全能型 AI 桌面应用，集智能对话、知识库管理、电脑操控于一体。

## 功能特性

### 智能对话
- 多轮对话上下文管理
- 支持 OpenAI/DeepSeek/Claude 等多种模型
- 流式响应
- Markdown 渲染和代码高亮
- 语音输入/输出
- 对话导出

### 知识库
- 文档上传和解析（PDF/DOCX/TXT/MD）
- 自动文本分块
- 向量化存储
- RAG 语义检索增强对话

### 电脑操控
- 文件管理器
- 应用启动/关闭
- 浏览器控制

### 个性设置
- 多模型供应商配置
- 自定义头像
- 语音参数调节
- 全局快捷键

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand
- **后端**: Tauri 2.0 + Rust
- **数据库**: SQLite
- **AI**: OpenAI API 兼容接口

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动桌面应用
pnpm tauri dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## 构建

```bash
# 构建生产版本
pnpm tauri build
```

## 项目结构

```
src/
├── components/     # React 组件
├── hooks/          # 自定义 Hooks
├── stores/         # Zustand 状态管理
├── services/       # API 服务
├── types/          # TypeScript 类型定义
└── lib/            # 工具函数

src-tauri/
├── src/
│   ├── commands/   # Tauri 命令
│   ├── services/   # Rust 服务
│   └── models/     # 数据模型
└── Cargo.toml
```

## 许可证

MIT