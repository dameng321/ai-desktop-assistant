# AI 桌面助手 - 开发任务追踪

> 最后更新：2026-03-18
> 版本：v1.0.0-MVP

## 📊 项目进度概览

| 模块 | 状态 | 进度 |
|------|------|------|
| 项目初始化 | ✅ 已完成 | 100% |
| 智能对话模块 | ✅ 已完成 | 100% |
| 设置中心模块 | ✅ 已完成 | 100% |
| Tauri 后端 | ✅ 已完成 | 100% |
| 电脑操控模块 | ✅ 已完成 | 100% |
| 知识库模块 | ✅ 已完成 | 100% |
| 微信互联模块 | 📋 待开始 | 0% |
| 形象声音模块 | 📋 待开始 | 0% |

---

## ✅ 已完成任务

### 项目初始化 (2026-03-17)
- [x] 创建 Vite + React + TypeScript 项目
- [x] 配置 Tailwind CSS
- [x] 配置 ESLint + TypeScript
- [x] 配置 Vitest 测试框架
- [x] 创建项目目录结构
- [x] 定义基础类型 (chat, knowledge, settings)
- [x] 创建 Zustand stores (chatStore, settingsStore)
- [x] 创建基础 UI 组件 (Button, Input)
- [x] 创建基础 App 组件（带侧边栏的对话界面）
- [x] 编写单元测试示例
- [x] 更新 AGENTS.md 配置文件
- [x] 创建任务追踪文件
- [x] 初始化 Git 仓库并推送到 GitHub

### 智能对话模块 - 基础功能 (2026-03-17)
- [x] 创建 `useChat` Hook（对话逻辑）
- [x] 创建 AI 服务接口 (`src/services/ai/`)
- [x] 实现 OpenAI API 调用
- [x] 实现流式响应
- [x] 创建 ChatWindow 组件
- [x] 创建 MessageList 组件
- [x] 创建 MessageItem 组件
- [x] 创建 InputBar 组件
- [x] 支持对话历史持久化（localStorage）
- [x] 编写测试用例（29 个测试全部通过）

### 智能对话模块 - 增强功能 (2026-03-17)
- [x] Markdown 渲染支持 (react-markdown + remark-gfm)
- [x] 代码高亮 (react-syntax-highlighter)
- [x] 消息复制功能
- [x] 对话删除功能
- [x] 对话标题编辑功能
- [x] ConversationItem 组件

### 设置中心模块 (2026-03-17)
- [x] 创建 SettingsPage 页面组件
- [x] 创建 SettingsLayout 布局组件
- [x] 创建 ModelSettings 模型配置组件
  - [x] API Key 配置和显示/隐藏
  - [x] 自定义 API 端点
  - [x] 连接测试功能
  - [x] 模型选择
  - [x] Temperature 和 MaxTokens 参数调节
- [x] 创建 GeneralSettings 通用设置组件
  - [x] 主题切换（浅色/深色/跟随系统）
  - [x] 语言设置
  - [x] 开机自启设置
  - [x] 启动最小化
  - [x] 关闭行为
- [x] 集成到 App

### Tauri 后端 (2026-03-17)
- [x] 初始化 Tauri 2.0 项目
- [x] 配置 tauri.conf.json
  - [x] 窗口配置 (1200x800)
  - [x] 系统托盘配置
  - [x] 安装包配置 (MSI/NSIS)
- [x] 更新 Cargo.toml 依赖
- [x] 创建数据模型
  - [x] FileItem
  - [x] AppInfo
  - [x] SystemInfo
- [x] 实现文件操作命令
  - [x] list_files - 列出文件
  - [x] create_folder - 创建文件夹
  - [x] delete_file - 删除文件
  - [x] move_file - 移动文件
  - [x] copy_file - 复制文件
  - [x] rename_file - 重命名
  - [x] search_files - 搜索文件
- [x] 实现应用操作命令
  - [x] list_apps - 列出应用
  - [x] open_app - 打开应用
  - [x] open_url - 打开网址
- [x] 实现系统操作命令
  - [x] get_system_info - 获取系统信息
  - [x] open_path - 打开路径
- [x] 创建前端 Tauri 服务

### 电脑操控模块 (2026-03-17)
- [x] 创建 `useFileManager` Hook
- [x] 创建 Breadcrumb 面包屑导航组件
- [x] 创建 FileList 文件列表组件
- [x] 创建 FileManager 主组件
- [x] 集成到 App（底部导航、视图切换）
- [x] 添加 get_user_paths 命令获取用户路径
- [x] 快捷访问功能（桌面/文档/下载/图片）
- [x] 文件/文件夹重命名功能
- [x] 文件/文件夹删除功能
- [x] 新建文件夹功能

### 模型配置增强 (2026-03-17)
- [x] 支持多模型供应商配置
- [x] 预设供应商：OpenAI、Anthropic、Google、DeepSeek、月之暗面、智谱、通义千问、Ollama
- [x] 支持添加自定义供应商
- [x] 支持自定义 API 端点
- [x] 支持自定义模型名称
- [x] 更新 AI 服务支持不同供应商 API 格式

### 系统托盘功能 (2026-03-18)
- [x] 添加系统托盘图标
- [x] 托盘右键菜单（显示/隐藏窗口、退出）
- [x] 左键点击托盘显示窗口
- [x] 关闭窗口时最小化到托盘

### 知识库模块 - 基础功能 (2026-03-18)
- [x] 创建 `knowledgeStore` (Zustand)
- [x] 创建 `useKnowledge` Hook
- [x] 创建 KnowledgeBaseList 组件
- [x] 创建 DocumentList 组件
- [x] 创建 KnowledgePage 主页面
- [x] 集成到 App 导航
- [x] 文档上传功能（文件选择对话框）

---

## 🚧 进行中任务

无

---

## 📋 待完成任务

### Phase 1: 智能对话模块 (V1.0 MVP)

#### 对话核心功能（增强）
- [x] 消息重新生成
- [x] 对话导出 (MD/TXT)
- [x] 多轮对话上下文管理优化

#### 语音对话功能
- [x] 创建 `useVoice` Hook
- [x] 集成语音识别 (Web Speech API)
- [x] 集成语音合成 (Web Speech API)
- [x] 创建 VoiceInput 组件
- [x] 语音参数设置

#### 快捷唤醒
- [x] 全局快捷键注册
- [x] 快捷键设置页面
- [x] 唤醒动画效果

---

### Phase 2: 知识库模块 (V1.0 MVP)

#### 知识库管理
- [x] 创建 `useKnowledge` Hook
- [x] 创建 KnowledgeService
- [x] 知识库 CRUD 操作
- [x] 创建 KnowledgeBaseList 组件
- [x] 创建 DocumentList 组件
- [x] 知识库持久化存储 (SQLite)

#### 文档处理
- [x] 文档上传功能
- [x] PDF 解析
- [x] DOCX 解析
- [x] 文本分块
- [ ] 创建 UploadZone 组件

#### RAG 检索
- [x] 集成向量数据库（SQLite + 向量存储）
- [x] 文本向量化 (OpenAI Embeddings API)
- [x] 语义相似度检索（余弦相似度）
- [x] 检索结果注入对话 (RAG)

---

### Phase 3: 电脑操控模块 (V1.0 MVP)

#### 文件操作 (Rust 后端)
- [ ] 创建 Tauri 文件操作命令
- [ ] 文件/文件夹列表
- [ ] 文件创建/删除/移动/复制
- [ ] 文件搜索
- [ ] 创建 FileManager 组件

#### 应用操作
- [ ] 创建应用启动命令
- [ ] 应用列表扫描
- [ ] 应用关闭命令
- [ ] 创建 AppLauncher 组件

#### 浏览器控制
- [ ] URL 打开功能
- [ ] 网页截图
- [ ] 创建 BrowserControl 组件

---

### Phase 4: Tauri 后端 (V1.0 MVP)

- [ ] 安装 Rust 环境
- [ ] 创建 Tauri 项目 (`src-tauri/`)
- [ ] 配置 `tauri.conf.json`
- [ ] 实现文件操作命令
- [ ] 实现应用操作命令
- [ ] 实现系统信息命令
- [ ] 配置系统托盘
- [ ] 配置自动更新

---

### Phase 5: 形象声音模块 (V1.5)

- [ ] 静态头像支持
- [ ] 形象选择器
- [ ] 声音选择器
- [ ] 语音参数调节
- [ ] Live2D 支持 (可选)

---

### Phase 6: 微信互联模块 (V1.5)

- [ ] 微信窗口检测
- [ ] 消息发送功能
- [ ] 消息读取功能
- [ ] 联系人列表
- [ ] 通话功能

---

## 🐛 已知问题

| 问题 | 状态 | 备注 |
|------|------|------|
| Rust 未安装 | 📋 待处理 | 需要用户手动安装 |

---

## 📝 开发日志

### 2026-03-17
- 完成项目初始化
- 创建基础项目结构
- 配置前端开发环境
- 实现基础对话界面骨架
- 添加全局中文回复规则
- 初始化 Git 仓库并推送到 GitHub
- **仓库地址**: https://github.com/dameng321/ai-desktop-assistant
- **完成智能对话模块基础功能**：
  - AI 服务接口（支持 OpenAI API 流式调用）
  - useChat Hook（对话核心逻辑）
  - 对话组件（ChatWindow, MessageList, MessageItem, InputBar）
  - 测试用例（29 个测试全部通过）
- **完成智能对话模块增强功能**：
  - Markdown 渲染支持
  - 代码高亮
  - 消息复制功能
  - 对话管理（删除、重命名）
- **完成设置中心模块**：
  - 模型配置（API Key、模型选择、参数调节）
  - 通用设置（主题切换、语言、启动选项）
  - 设置页面布局
- **完成 Tauri 后端**：
  - 初始化 Tauri 2.0 项目
  - 文件操作命令（列表、创建、删除、移动、复制、重命名、搜索）
  - 应用操作命令（列表、打开应用、打开网址）
  - 系统操作命令（系统信息、打开路径）
  - 前端 Tauri 服务封装
- **完成电脑操控模块**：
  - 文件管理界面（FileManager, Breadcrumb, FileList）
  - useFileManager Hook
  - 快捷访问功能（桌面/文档/下载/图片）
  - 文件/文件夹操作（新建、删除、重命名）
  - 获取用户路径命令 (get_user_paths)
- **完成模型配置增强**：
  - 多模型供应商支持（OpenAI、Anthropic、Google、DeepSeek、月之暗面、智谱、通义千问、Ollama）
  - 自定义供应商配置
  - 自定义 API 端点和模型
  - 不同供应商 API 格式适配
- **完成对话增强功能**：
  - 消息重新生成功能
  - 对话导出功能（Markdown/纯文本）
- **完成系统托盘功能**：
  - 系统托盘图标
  - 托盘右键菜单（显示/隐藏窗口、退出）
  - 左键点击显示窗口
  - 关闭窗口时最小化到托盘

### 2026-03-18
- **修复模型配置问题**：
  - 修复切换供应商时默认模型未更新的问题
  - 添加自动获取模型列表功能（fetch_models 命令）
  - 优化模型选择下拉框显示逻辑
- **开始知识库模块开发**：
  - 创建 knowledgeStore (Zustand)
  - 创建 useKnowledge Hook
  - 创建 KnowledgeBaseList 组件（知识库列表）
  - 创建 DocumentList 组件（文档列表）
  - 创建 KnowledgePage 主页面
  - 集成到 App 导航
  - 实现文档上传功能（文件选择对话框）
- **完成 Phase 1 智能对话模块增强**：
  - 多轮对话上下文管理优化（可配置窗口大小和策略）
  - 创建 useVoice Hook（语音识别和合成）
  - 集成 Web Speech API（语音识别和合成）
  - 创建 VoiceInput 组件（已集成到输入框）
  - 语音参数设置页面
  - 全局快捷键注册（Ctrl+Shift+A 唤醒窗口）
  - 快捷键设置页面
  - 唤醒动画效果组件

### 2026-03-18 (续)
- **完善知识库模块**：
  - 实现 PDF 文档解析（使用 pdf-extract）
  - 实现 DOCX 文档解析（使用 docx-rs）
  - 实现 TXT/MD 文档解析
  - 实现文本分块功能（可配置大小和重叠）
  - 创建知识库 Tauri 命令（parse_document, get_document_info）
  - 更新 DocumentList 组件支持真实的文档解析
  - 创建 knowledgeService 前端服务
- **实现 RAG 检索功能**：
  - SQLite 存储向量数据（BLOB 格式）
  - 实现余弦相似度计算
  - 集成 OpenAI Embeddings API
  - 生成文档向量功能
  - 语义相似度检索
  - RAG 对话集成（自动检索相关知识注入上下文）
- **知识库模块完成**：
  - 知识库 CRUD 操作（创建、列表、删除）
  - 文档管理（上传、解析、分块、删除）
  - 向量检索和语义搜索
  - RAG 对话增强

---

## 🔄 如何在新电脑上继续开发

1. **克隆项目**
   ```bash
   git clone https://github.com/dameng321/ai-desktop-assistant.git
   cd ai-desktop-assistant
   ```

2. **安装依赖**
   ```bash
   # 安装 pnpm（如果没有）
   npm install -g pnpm
   
   # 安装项目依赖
   pnpm install
   ```

3. **安装 Rust（用于 Tauri）**
   - Windows: 下载 [rustup-init.exe](https://rustup.rs/)
   - 或运行: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

4. **查看当前进度**
   ```bash
   # 查看此文件了解进度
   cat TODO.md
   
   # 查看正在进行的任务
   grep "🚧" TODO.md
   ```

5. **开始开发**
   ```bash
   # 启动开发服务器
   pnpm dev
   
   # 运行测试
   pnpm test
   
   # 类型检查
   pnpm typecheck
   ```

---

## 📌 下一步行动

**当前优先级**: 开始 Phase 3 电脑操控模块增强

1. 实现应用启动和关闭功能增强
2. 实现浏览器控制功能
3. 实现网页截图功能
4. 或者开始 Phase 5 形象声音模块

---

## 📦 Git 提交记录

| 提交 | 描述 |
|------|------|
| `feat: 项目初始化` | 项目基础结构和配置 |
| `docs: 更新 TODO.md 添加 GitHub 仓库地址` | 文档更新 |
| `feat(ai-service): 创建 AI 服务接口` | AI 服务接口、OpenAI Provider |
| `feat(hooks): 创建 useChat Hook` | 对话核心逻辑 |
| `feat(chat): 创建对话组件` | ChatWindow, MessageList, MessageItem, InputBar |
| `test: 添加智能对话模块测试用例` | 29 个测试用例 |
| `docs: 更新 TODO.md 进度` | 进度更新 |
| `feat(settings): 创建设置中心模块` | 设置页面、模型配置、通用设置 |
| `feat(chat): 添加 Markdown 渲染和代码高亮支持` | Markdown、代码高亮、复制 |
| `feat(chat): 添加对话管理功能` | 删除、重命名对话 |
| `feat(control): 添加文件管理界面组件` | 文件管理界面、底部导航 |
| `feat(control): 完善文件管理功能` | 用户路径、文件夹操作 |
| `feat(model): 支持多模型供应商配置` | 多供应商、自定义 API、自定义模型 |
| `feat(chat): 添加消息重新生成功能` | 重新生成 AI 回复 |
| `feat(chat): 添加对话导出功能` | 导出为 Markdown/文本 |
| `feat(tray): 添加系统托盘功能` | 托盘图标、菜单、最小化到托盘 |
| `fix(model): 修复模型选择问题` | 切换供应商时更新默认模型 |
| `feat(model): 添加获取模型列表功能` | 自动从 API 获取可用模型 |
| `feat(knowledge): 创建知识库模块基础功能` | Store、Hook、组件、页面 |
| `feat(knowledge): 实现文档解析功能` | PDF、DOCX、TXT、MD 解析和分块 |
| `feat(knowledge): 实现知识库持久化存储` | SQLite 数据库存储 |
| `feat(knowledge): 实现 RAG 检索功能` | 向量存储、Embeddings、语义搜索 |
| `feat(chat): 集成 RAG 到对话` | 知识库检索增强对话 |

---

> 💡 **提示**: 完成每个任务后，请更新此文件中的状态（`[ ]` → `[x]`），并更新开发日志。