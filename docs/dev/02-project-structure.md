# 项目结构

## 目录结构

```
ai-desktop-assistant/
├── src/                          # 前端源码
│   ├── main.tsx                  # 入口文件
│   ├── App.tsx                   # 根组件
│   ├── vite-env.d.ts             # Vite类型定义
│   │
│   ├── assets/                   # 静态资源
│   │   ├── images/               # 图片
│   │   ├── icons/                # 图标
│   │   ├── avatars/              # 默认头像
│   │   └── sounds/               # 音效
│   │
│   ├── components/               # 组件
│   │   ├── ui/                   # 基础UI组件(Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   │
│   │   ├── chat/                 # 对话组件
│   │   │   ├── ChatWindow.tsx    # 对话窗口
│   │   │   ├── MessageList.tsx   # 消息列表
│   │   │   ├── MessageItem.tsx   # 消息项
│   │   │   ├── InputBar.tsx      # 输入栏
│   │   │   ├── VoiceInput.tsx    # 语音输入
│   │   │   └── PromptTemplates.tsx # 提示词模板
│   │   │
│   │   ├── control/              # 电脑控制组件
│   │   │   ├── FileManager.tsx   # 文件管理
│   │   │   ├── AppLauncher.tsx   # 应用启动
│   │   │   ├── BrowserControl.tsx # 浏览器控制
│   │   │   ├── ScreenControl.tsx # 屏幕控制
│   │   │   └── TaskAutomation.tsx # 任务自动化
│   │   │
│   │   ├── wechat/               # 微信组件
│   │   │   ├── WechatPanel.tsx   # 微信面板
│   │   │   ├── ContactList.tsx   # 联系人列表
│   │   │   ├── ChatView.tsx      # 聊天视图
│   │   │   └── CallButton.tsx    # 通话按钮
│   │   │
│   │   ├── avatar/               # 形象组件
│   │   │   ├── AvatarDisplay.tsx # 形象展示
│   │   │   ├── AvatarSelector.tsx # 形象选择
│   │   │   ├── VoiceSelector.tsx # 声音选择
│   │   │   └── Live2DViewer.tsx  # Live2D查看器
│   │   │
│   │   ├── knowledge/            # 知识库组件
│   │   │   ├── KnowledgeBaseList.tsx # 知识库列表
│   │   │   ├── DocumentList.tsx  # 文档列表
│   │   │   ├── UploadZone.tsx    # 上传区域
│   │   │   └── KnowledgeStats.tsx # 知识库统计
│   │   │
│   │   ├── settings/             # 设置组件
│   │   │   ├── SettingsLayout.tsx # 设置布局
│   │   │   ├── GeneralSettings.tsx # 通用设置
│   │   │   ├── ModelSettings.tsx # 模型设置
│   │   │   ├── ShortcutSettings.tsx # 快捷键设置
│   │   │   ├── PrivacySettings.tsx # 隐私设置
│   │   │   └── PermissionSettings.tsx # 权限设置
│   │   │
│   │   └── common/               # 通用组件
│   │       ├── Sidebar.tsx       # 侧边栏
│   │       ├── Header.tsx        # 头部
│   │       ├── Toast.tsx         # 提示
│   │       ├── Modal.tsx         # 弹窗
│   │       ├── Loading.tsx       # 加载
│   │       └── Empty.tsx         # 空状态
│   │
│   ├── pages/                    # 页面
│   │   ├── Home.tsx              # 主页(对话)
│   │   ├── Control.tsx            # 电脑控制
│   │   ├── Wechat.tsx            # 微信互联
│   │   ├── Knowledge.tsx         # 知识库
│   │   ├── Settings.tsx          # 设置
│   │   └── AvatarSetup.tsx       # 形象设置
│   │
│   ├── hooks/                    # 自定义Hooks
│   │   ├── useChat.ts            # 对话逻辑
│   │   ├── useVoice.ts           # 语音逻辑
│   │   ├── useKnowledge.ts       # 知识库逻辑
│   │   ├── useControl.ts         # 控制逻辑
│   │   ├── useWechat.ts          # 微信逻辑
│   │   ├── useAvatar.ts          # 形象逻辑
│   │   ├── useShortcuts.ts       # 快捷键
│   │   └── useSettings.ts        # 设置逻辑
│   │
│   ├── stores/                   # 状态管理
│   │   ├── chatStore.ts          # 对话状态
│   │   ├── settingsStore.ts      # 设置状态
│   │   ├── knowledgeStore.ts     # 知识库状态
│   │   ├── avatarStore.ts        # 形象状态
│   │   └── uiStore.ts            # UI状态
│   │
│   ├── services/                 # 服务层
│   │   ├── ai/                   # AI服务
│   │   │   ├── index.ts          # 入口
│   │   │   ├── openai.ts         # OpenAI
│   │   │   ├── ollama.ts         # Ollama
│   │   │   └── types.ts          # 类型定义
│   │   │
│   │   ├── voice/                # 语音服务
│   │   │   ├── stt.ts            # 语音识别
│   │   │   ├── tts.ts            # 语音合成
│   │   │   └── types.ts
│   │   │
│   │   ├── knowledge/             # 知识库服务
│   │   │   ├── index.ts
│   │   │   ├── document.ts       # 文档处理
│   │   │   ├── embedding.ts      # 向量化
│   │   │   ├── retrieval.ts      # 检索
│   │   │   └── types.ts
│   │   │
│   │   └── api/                   # API调用
│   │       ├── client.ts          # HTTP客户端
│   │       └── tauri.ts           # Tauri IPC
│   │
│   ├── lib/                      # 工具库
│   │   ├── utils.ts              # 通用工具
│   │   ├── constants.ts          # 常量
│   │   ├── validators.ts         # 验证器
│   │   └── formatters.ts         # 格式化
│   │
│   └── types/                    # 类型定义
│       ├── chat.ts               # 对话类型
│       ├── knowledge.ts          # 知识库类型
│       ├── settings.ts           # 设置类型
│       ├── avatar.ts             # 形象类型
│       └── api.ts                # API类型
│
├── src-tauri/                    # Tauri后端(Rust)
│   ├── src/
│   │   ├── main.rs               # 入口
│   │   ├── lib.rs                # 库入口
│   │   │
│   │   ├── commands/             # Tauri命令
│   │   │   ├── mod.rs
│   │   │   ├── file.rs           # 文件操作
│   │   │   ├── app.rs            # 应用操作
│   │   │   ├── browser.rs        # 浏览器操作
│   │   │   ├── screen.rs         # 屏幕操作
│   │   │   ├── wechat.rs         # 微信操作
│   │   │   └── system.rs         # 系统操作
│   │   │
│   │   ├── services/             # 服务
│   │   │   ├── mod.rs
│   │   │   ├── ai_service.rs     # AI服务
│   │   │   ├── voice_service.rs  # 语音服务
│   │   │   └── knowledge_service.rs # 知识库服务
│   │   │
│   │   ├── db/                   # 数据库
│   │   │   ├── mod.rs
│   │   │   ├── sqlite.rs         # SQLite操作
│   │   │   └── models.rs         # 数据模型
│   │   │
│   │   ├── utils/                # 工具
│   │   │   ├── mod.rs
│   │   │   ├── config.rs         # 配置
│   │   │   └── logger.rs         # 日志
│   │   │
│   │   └── models/               # 数据模型
│   │       ├── mod.rs
│   │       ├── conversation.rs
│   │       ├── knowledge.rs
│   │       └── settings.rs
│   │
│   ├── Cargo.toml                # Rust依赖
│   ├── tauri.conf.json          # Tauri配置
│   └── build.rs                 # 构建脚本
│
├── public/                       # 公共资源
│   ├── favicon.ico
│   └── robots.txt
│
├── tests/                        # 测试
│   ├── unit/                     # 单元测试
│   ├── e2e/                      # E2E测试
│   └── fixtures/                 # 测试数据
│
├── docs/                         # 文档
│   ├── PRD.md                    # 产品需求文档
│   └── dev/                      # 开发文档
│
├── scripts/                      # 脚本
│   ├── build.sh                  # 构建脚本
│   └── release.sh                # 发布脚本
│
├── .gitignore
├── .env.example                  # 环境变量示例
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json               # Shadcn配置
└── README.md
```

## 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  Home │ Control │ Wechat │ Knowledge │ Settings │ Avatar   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Components                               │
│  chat │ control │ wechat │ avatar │ knowledge │ settings   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hooks                                   │
│  useChat │ useVoice │ useKnowledge │ useControl │ useWechat │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Stores                                  │
│  chatStore │ settingsStore │ knowledgeStore │ avatarStore   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services                                │
│  ai │ voice │ knowledge │ api │ tauri                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tauri Backend (Rust)                      │
│  commands │ services │ db │ utils                           │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

### 对话数据流

```
用户输入 → InputBar → useChat Hook → chatStore
                                      │
                                      ▼
                              AI Service (Frontend)
                                      │
                                      ▼
                              Tauri Command
                                      │
                                      ▼
                              AI Service (Rust)
                                      │
                                      ▼
                              OpenAI API / Ollama
                                      │
                                      ▼
                              响应流式返回
                                      │
                                      ▼
                              MessageList 更新显示
```

### 知识库数据流

```
上传文档 → UploadZone → useKnowledge Hook
                              │
                              ▼
                      Tauri Command
                              │
                              ▼
                      Document Parser (Rust)
                              │
                              ▼
                      Text Chunks
                              │
                              ▼
                      Embedding Service
                              │
                              ▼
                      Vector Store (ChromaDB)
                              │
                              ▼
                      对话时检索使用
```

### 电脑操控数据流

```
用户指令 → ControlPanel → useControl Hook
                              │
                              ▼
                      AI解析意图
                              │
                              ▼
                      Tauri Command
                              │
                              ▼
                      系统操作 (Rust)
                              │
                              ├→ 文件操作
                              ├→ 应用操作
                              ├→ 浏览器操作
                              └→ 屏幕操作
                              │
                              ▼
                      返回结果
```