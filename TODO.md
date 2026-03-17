# AI 桌面助手 - 开发任务追踪

> 最后更新：2026-03-17
> 版本：v1.0.0-MVP

## 📊 项目进度概览

| 模块 | 状态 | 进度 |
|------|------|------|
| 项目初始化 | ✅ 已完成 | 100% |
| 智能对话模块 | 🚧 进行中 | 30% |
| 知识库模块 | 📋 待开始 | 0% |
| 电脑操控模块 | 📋 待开始 | 0% |
| 微信互联模块 | 📋 待开始 | 0% |
| 形象声音模块 | 📋 待开始 | 0% |
| 设置中心模块 | 📋 待开始 | 0% |

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

---

## 🚧 进行中任务

### 智能对话模块 - 基础功能
- [ ] 创建 `useChat` Hook（对话逻辑）
- [ ] 创建 AI 服务接口 (`src/services/ai/`)
- [ ] 实现 OpenAI API 调用
- [ ] 实现流式响应
- [ ] 创建 ChatWindow 组件
- [ ] 创建 MessageList 组件
- [ ] 创建 MessageItem 组件
- [ ] 创建 InputBar 组件
- [ ] 支持对话历史持久化
- [ ] 编写测试用例

---

## 📋 待完成任务

### Phase 1: 智能对话模块 (V1.0 MVP)

#### 对话核心功能
- [ ] 多轮对话上下文管理
- [ ] Markdown 渲染支持
- [ ] 代码高亮
- [ ] 消息复制功能
- [ ] 消息重新生成
- [ ] 对话导出 (MD/TXT)

#### 语音对话功能
- [ ] 创建 `useVoice` Hook
- [ ] 集成语音识别 (Whisper API)
- [ ] 集成语音合成 (Edge TTS)
- [ ] 创建 VoiceInput 组件
- [ ] 语音参数设置

#### 快捷唤醒
- [ ] 全局快捷键注册
- [ ] 快捷键设置页面
- [ ] 唤醒动画效果

---

### Phase 2: 知识库模块 (V1.0 MVP)

#### 知识库管理
- [ ] 创建 `useKnowledge` Hook
- [ ] 创建 KnowledgeService
- [ ] 知识库 CRUD 操作
- [ ] 创建 KnowledgeBaseList 组件
- [ ] 创建 DocumentList 组件

#### 文档处理
- [ ] 文档上传功能
- [ ] PDF 解析
- [ ] DOCX 解析
- [ ] 文本分块
- [ ] 创建 UploadZone 组件

#### RAG 检索
- [ ] 集成向量数据库
- [ ] 文本向量化 (Embeddings)
- [ ] 相似度检索
- [ ] 检索结果注入对话

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

### Phase 7: 设置中心模块

#### 基础设置
- [ ] 主题切换 (浅色/深色/跟随系统)
- [ ] 语言设置
- [ ] 开机自启设置

#### 模型设置
- [ ] API Key 配置
- [ ] 模型选择
- [ ] 参数调节 (Temperature, MaxTokens)
- [ ] 连接测试

#### 快捷键设置
- [ ] 快捷键自定义
- [ ] 冲突检测

#### 隐私设置
- [ ] 数据导出
- [ ] 数据清除
- [ ] 存储路径设置

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

**当前优先级**: 智能对话模块基础功能

1. 创建 `src/hooks/useChat.ts` - 对话核心逻辑
2. 创建 `src/services/ai/index.ts` - AI 服务接口
3. 实现 OpenAI API 流式调用
4. 完善对话界面组件

---

> 💡 **提示**: 完成每个任务后，请更新此文件中的状态（`[ ]` → `[x]`），并更新开发日志。