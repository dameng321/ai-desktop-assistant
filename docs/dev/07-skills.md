# OpenCode 技能清单

本文档列出了使用 OpenCode 开发 AI 桌面助手所需的所有技能和工具。

---

## 核心技能

### 1. Frontend Development (senior-frontend)

**用途**：React + TypeScript 前端开发

**使用场景**：
- 创建 React 组件
- 实现 UI 界面
- 状态管理 (Zustand)
- 性能优化

**调用方式**：
```
/skill senior-frontend
```

**典型任务**：
```
创建对话组件，包含消息列表和输入框
优化组件渲染性能
实现深色模式切换
```

---

### 2. Frontend Design (frontend-design)

**用途**：高质量 UI 设计和实现

**使用场景**：
- 设计应用界面
- 创建美观的组件
- 动画效果实现

**调用方式**：
```
/skill frontend-design
```

**典型任务**：
```
设计主窗口布局
创建数字人形象展示组件
实现流畅的动画效果
```

---

### 3. Frontend Patterns (frontend-patterns)

**用途**：前端设计模式和最佳实践

**使用场景**：
- 状态管理模式
- 组件设计模式
- 性能优化模式

**调用方式**：
```
/skill frontend-patterns
```

---

### 4. Frontend Testing (frontend-testing)

**用途**：单元测试和集成测试

**使用场景**：
- 编写组件测试
- 编写 Hook 测试
- 测试覆盖率

**调用方式**：
```
/skill frontend-testing
```

**典型任务**：
```
为 ChatWindow 组件编写测试
为 useChat Hook 编写测试
```

---

### 5. Frontend Code Review (frontend-code-review)

**用途**：代码审查

**使用场景**：
- 审查前端代码
- 发现潜在问题
- 提出优化建议

**调用方式**：
```
/skill frontend-code-review
```

---

## 开发流程中的技能应用

### Phase 1: 项目初始化

```bash
# 创建项目结构
opencode> 创建 Tauri + React 项目结构

# 安装依赖
opencode> 安装 Shadcn/ui 和 Tailwind CSS
/skill senior-frontend

# 配置项目
opencode> 配置 TypeScript、ESLint、Prettier
```

### Phase 2: UI 开发

```bash
# 设计界面
opencode> 设计主窗口布局，包含侧边栏、对话区、输入框
/skill frontend-design

# 创建组件
opencode> 创建 ChatWindow 组件
/skill senior-frontend

# 添加样式
opencode> 实现深色模式支持
/skill frontend-design
```

### Phase 3: 功能开发

```bash
# 创建 Store
opencode> 创建 chatStore，管理对话状态
/skill senior-frontend

# 创建 Hook
opencode> 创建 useChat Hook，实现对话逻辑
/skill senior-frontend

# 创建 Service
opencode> 创建 AI 服务，调用 OpenAI API
```

### Phase 4: 后端开发

```bash
# 创建 Tauri 命令
opencode> 创建文件操作相关的 Tauri 命令

# 创建数据模型
opencode> 创建 Rust 数据模型

# 实现业务逻辑
opencode> 实现文件搜索功能
```

### Phase 5: 测试

```bash
# 编写单元测试
opencode> 为 useChat Hook 编写测试
/skill frontend-testing

# 编写组件测试
opencode> 为 ChatWindow 编写测试
/skill frontend-testing

# 运行测试
opencode> pnpm test
```

### Phase 6: 代码审查

```bash
# 审查代码
opencode> 审查 src/components/chat 目录下的代码
/skill frontend-code-review

# 修复问题
opencode> 修复审查发现的问题
```

---

## 技能详细说明

### senior-frontend

**提供的功能**：
- React 组件最佳实践
- TypeScript 类型定义
- Hooks 使用规范
- 状态管理模式
- 性能优化技巧

**示例用法**：
```
用户: 创建一个消息列表组件，支持无限滚动和虚拟列表
/skill senior-frontend

助手会：
1. 创建符合 React 最佳实践的组件
2. 使用 TypeScript 定义类型
3. 实现虚拟列表优化
4. 添加必要的注释
```

### frontend-design

**提供的功能**：
- UI 设计原则
- 视觉层次设计
- 动画和交互设计
- 响应式设计
- 深色模式设计

**示例用法**：
```
用户: 设计一个美观的知识库管理界面
/skill frontend-design

助手会：
1. 创建有设计感的界面
2. 添加合适的动画效果
3. 实现响应式布局
4. 支持深色模式
```

### frontend-testing

**提供的功能**：
- Vitest 测试配置
- React Testing Library 使用
- Hook 测试方法
- Mock 技巧
- 测试覆盖率配置

**示例用法**：
```
用户: 为 useKnowledge Hook 编写完整测试
/skill frontend-testing

助手会：
1. 创建测试文件
2. 编写各种场景的测试用例
3. Mock 外部依赖
4. 确保测试覆盖率
```

---

## 自定义技能配置

可以创建项目特定的技能配置：

### 创建 .agents/skills/ 目录

```
.agents/
└── skills/
    └── tauri-dev/
        └── SKILL.md
```

### SKILL.md 内容示例

```markdown
# Tauri Development Skill

## 描述
用于开发 Tauri 桌面应用的技能

## 指南

### Tauri 命令规范
- 使用 async 函数
- 返回 Result<T, String>
- 参数使用 snake_case
- 添加错误处理

### 示例

```rust
#[tauri::command]
async fn my_command(param: String) -> Result<MyResult, String> {
    // 实现
}
```

### 前端调用

```typescript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke<MyResult>('my_command', { param: 'value' });
```
```

---

## 常用开发命令

### OpenCode 命令

| 命令 | 说明 |
|-----|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建前端 |
| `pnpm tauri dev` | 启动 Tauri 开发模式 |
| `pnpm tauri build` | 打包应用 |
| `pnpm test` | 运行测试 |
| `pnpm lint` | 代码检查 |
| `pnpm typecheck` | 类型检查 |

### Tauri 命令

| 命令 | 说明 |
|-----|------|
| `pnpm tauri dev` | 开发模式 |
| `pnpm tauri build` | 构建应用 |
| `pnpm tauri icon` | 生成图标 |
| `pnpm tauri info` | 查看环境信息 |

---

## 项目配置文件

### package.json

```json
{
  "name": "ai-desktop-assistant",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.x",
    "openai": "^4.x"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "vitest": "^1.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
});
```

### tauri.conf.json

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/schema.json",
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "AI桌面助手",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": true,
      "fs": {
        "all": true,
        "scope": ["$HOME/**", "$DOCUMENT/**", "$DOWNLOAD/**"]
      },
      "shell": {
        "all": true,
        "execute": true,
        "open": true
      },
      "window": {
        "all": true
      },
      "system": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.ai-desktop-assistant",
      "longDescription": "AI桌面助手 - 全能型AI生活助手",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "AI桌面助手",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 700,
        "resizable": true,
        "title": "AI桌面助手",
        "width": 1000,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

---

## 开发工具推荐

### VSCode 扩展

| 扩展 | 用途 |
|-----|------|
| rust-analyzer | Rust 开发 |
| Tauri | Tauri 开发 |
| Tailwind CSS IntelliSense | Tailwind 智能提示 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |

### 浏览器 DevTools

- React Developer Tools
- Redux DevTools (如果使用)

---

## 注意事项

1. **使用技能时**：在请求开头使用 `/skill` 命令加载相应技能
2. **代码规范**：遵循项目定义的代码规范
3. **测试优先**：重要功能需要编写测试
4. **性能考虑**：注意大文件和大量数据的处理
5. **安全性**：敏感信息不要硬编码，使用环境变量