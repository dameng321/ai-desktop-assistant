# AI桌面助手 开发文档

> 版本：v1.0  
> 开发工具：OpenCode  
> 目标平台：Windows 10/11

---

## 文档索引

| 文档 | 说明 |
|-----|------|
| [技术栈选型](./01-tech-stack.md) | 技术选型与架构设计 |
| [项目结构](./02-project-structure.md) | 目录结构与模块划分 |
| [开发指南](./03-development-guide.md) | 开发流程与规范 |
| [API设计](./04-api-design.md) | 接口设计文档 |
| [模块开发](./05-modules.md) | 各模块详细开发文档 |
| [部署运维](./06-deployment.md) | 打包发布与运维 |
| [OpenCode技能清单](./07-skills.md) | 开发所需的技能列表 |

---

## 快速开始

### 环境要求

```
Node.js >= 18.0.0
pnpm >= 8.0.0
Python >= 3.10（可选，用于本地模型）
```

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

---

## 核心技术栈

| 层级 | 技术选型 |
|-----|---------|
| 桌面框架 | Tauri 2.0 |
| 前端框架 | React 18 + TypeScript |
| UI组件 | Shadcn/ui + Tailwind CSS |
| 状态管理 | Zustand |
| 后端逻辑 | Rust (Tauri) |
| 数据存储 | SQLite + LevelDB |
| AI对话 | OpenAI API / Ollama |
| 知识库 | LangChain + ChromaDB |

---

## 开发阶段规划

### Phase 1: 基础框架 (Week 1-2)

- [x] 项目初始化
- [ ] Tauri应用框架搭建
- [ ] React前端框架搭建
- [ ] 基础UI组件库
- [ ] 路由与状态管理
- [ ] 配置系统

### Phase 2: 核心功能 (Week 3-4)

- [ ] AI对话模块
- [ ] 知识库基础功能
- [ ] 数据存储层
- [ ] 设置系统

### Phase 3: 电脑操控 (Week 5-6)

- [ ] 文件操作模块
- [ ] 应用启动模块
- [ ] 浏览器控制模块
- [ ] 权限系统

### Phase 4: 完善优化 (Week 7-8)

- [ ] 形象系统
- [ ] 微信互联
- [ ] 测试与优化
- [ ] 打包发布

---

## 联系方式

- 项目地址：待定
- 问题反馈：GitHub Issues