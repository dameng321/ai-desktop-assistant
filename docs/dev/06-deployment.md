# 部署运维文档

## 1. 构建配置

### 1.1 Tauri 配置

`src-tauri/tauri.conf.json`:

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
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": true,
      "fs": {
        "all": true,
        "scope": ["$HOME/**", "$DOCUMENT/**", "$DOWNLOAD/**", "$DESKTOP/**"]
      },
      "shell": {
        "all": true,
        "execute": true,
        "open": true,
        "scope": [
          {
            "name": "run-command",
            "cmd": "cmd",
            "args": true
          }
        ]
      },
      "window": {
        "all": true
      },
      "system": {
        "all": true
      },
      "clipboard": {
        "all": true
      },
      "dialog": {
        "all": true
      },
      "notification": {
        "all": true
      },
      "globalShortcut": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Productivity",
      "copyright": "Copyright © 2026",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.ai-desktop-assistant.app",
      "longDescription": "AI桌面助手 - 全能型AI生活助手，集电脑操作、智能对话、知识训练于一体",
      "shortDescription": "AI桌面助手",
      "targets": ["msi", "nsis"],
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": "",
        "wix": {
          "language": "zh-CN"
        },
        "nsis": {
          "languages": ["SimpChinese", "English"],
          "displayLanguageSelector": true
        }
      }
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' https: data:; connect-src 'self' https: wss:; script-src 'self' 'unsafe-inline'"
    },
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false
    },
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-domain.com/api/update/{{target}}/{{arch}}/{{current_version}}"
      ],
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    },
    "windows": [
      {
        "title": "AI桌面助手",
        "width": 1200,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true,
        "decorations": true,
        "transparent": false
      }
    ]
  }
}
```

### 1.2 Vite 配置

`vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          state: ['zustand'],
        },
      },
    },
  },
});
```

---

## 2. 构建命令

### 2.1 开发构建

```bash
# 启动开发服务器
pnpm dev

# 启动 Tauri 开发模式
pnpm tauri dev
```

### 2.2 生产构建

```bash
# 构建前端
pnpm build

# 构建并打包应用
pnpm tauri build
```

### 2.3 指定目标平台

```bash
# 仅构建 Windows MSI
pnpm tauri build --bundles msi

# 仅构建 NSIS 安装程序
pnpm tauri build --bundles nsis

# 构建所有格式
pnpm tauri build --bundles all
```

---

## 3. 图标生成

### 3.1 准备源图标

准备一个 1024x1024 的 PNG 图片作为源图标。

### 3.2 生成各尺寸图标

```bash
# 使用 Tauri CLI 生成图标
pnpm tauri icon /path/to/icon.png
```

这会自动生成以下图标：
- `icons/32x32.png`
- `icons/128x128.png`
- `icons/128x128@2x.png`
- `icons/icon.icns` (macOS)
- `icons/icon.ico` (Windows)

---

## 4. 代码签名

### 4.1 Windows 代码签名

1. 获取代码签名证书
2. 配置 `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
      }
    }
  }
}
```

3. 构建时签名：

```bash
# 设置环境变量
set SIGNTOOL_PATH=C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe

# 构建
pnpm tauri build
```

### 4.2 macOS 代码签名

1. 获取 Apple Developer 证书
2. 配置 `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
        "entitlements": "entitlements.plist",
        "providerShortName": "TEAM_ID"
      }
    }
  }
}
```

---

## 5. 自动更新

### 5.1 生成密钥对

```bash
# 安装 Tauri CLI
cargo install tauri-cli

# 生成密钥对
cargo tauri signer generate -w ~/.tauri/myapp.key
```

保存输出的公钥，用于 `tauri.conf.json` 中的 `updater.pubkey`。

### 5.2 更新服务器

创建更新服务 API 端点：

```typescript
// 更新服务示例 (Node.js/Express)
app.get('/api/update/:target/:arch/:current_version', async (req, res) => {
  const { target, arch, current_version } = req.params;
  
  // 检查是否有新版本
  const latestVersion = await getLatestVersion();
  
  if (compareVersions(latestVersion.version, current_version) <= 0) {
    return res.status(204).send();
  }
  
  // 返回更新信息
  res.json({
    version: latestVersion.version,
    notes: latestVersion.notes,
    pub_date: latestVersion.releaseDate,
    platforms: {
      [`${target}-${arch}`]: {
        signature: latestVersion.signature,
        url: `https://your-domain.com/downloads/app_${latestVersion.version}_${arch}.msi`,
      },
    },
  });
});
```

### 5.3 前端检查更新

```typescript
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

async function checkForUpdates() {
  try {
    const { shouldUpdate, manifest } = await checkUpdate();
    
    if (shouldUpdate) {
      const confirmed = confirm(
        `发现新版本 ${manifest?.version}\n${manifest?.notes || ''}\n\n是否立即更新？`
      );
      
      if (confirmed) {
        await installUpdate();
        await relaunch();
      }
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
}
```

---

## 6. 日志管理

### 6.1 Rust 日志配置

`src-tauri/src/main.rs`:

```rust
use log::{info, error, LevelFilter};
use tauri_plugin_log::{LogTarget, LoggerBuilder};

fn main() {
    tauri::Builder::default()
        .plugin(LoggerBuilder::new()
            .targets([
                LogTarget::Folder("logs".into()),
                LogTarget::Stdout,
            ])
            .level(LevelFilter::Info)
            .build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 6.2 日志文件位置

- Windows: `%APPDATA%/ai-desktop-assistant/logs/`
- macOS: `~/Library/Application Support/ai-desktop-assistant/logs/`
- Linux: `~/.config/ai-desktop-assistant/logs/`

---

## 7. 数据备份

### 7.1 用户数据目录

```
Windows: %APPDATA%/ai-desktop-assistant/
macOS: ~/Library/Application Support/ai-desktop-assistant/
Linux: ~/.config/ai-desktop-assistant/
```

### 7.2 备份内容

| 文件/目录 | 说明 |
|----------|------|
| `config/` | 用户配置 |
| `conversations/` | 对话历史 |
| `knowledge/` | 知识库数据 |
| `settings.json` | 应用设置 |

### 7.3 导出功能

```rust
#[tauri::command]
async fn export_data(output_path: String) -> Result<(), String> {
    let data_dir = app_data_dir()?;
    let output = PathBuf::from(&output_path);
    
    // 创建临时目录
    let temp_dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    
    // 复制数据
    copy_dir_all(&data_dir, temp_dir.path())?;
    
    // 压缩
    let file = File::create(&output).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    // ... 压缩逻辑
    
    Ok(())
}
```

---

## 8. 性能优化

### 8.1 前端优化

- 代码分割（已在 Vite 配置中设置）
- 虚拟列表（大量消息时）
- 图片懒加载
- 防抖和节流

### 8.2 后端优化

- 异步操作（使用 async/await）
- 数据库索引
- 缓存常用数据
- 限制并发请求数

### 8.3 打包优化

```toml
# Cargo.toml
[profile.release]
lto = true
codegen-units = 1
panic = "abort"
strip = true
opt-level = "z"
```

---

## 9. 监控与告警

### 9.1 错误监控

可选集成 Sentry：

```rust
// src-tauri/src/main.rs
use sentry;

fn main() {
    let _guard = sentry::init(("YOUR_DSN", sentry::ClientOptions {
        release: sentry::release_name!(),
        ..Default::default()
    }));
    
    // ...
}
```

### 9.2 性能监控

```typescript
// 前端性能监控
const startTime = performance.now();

// 执行操作
await someOperation();

const duration = performance.now() - startTime;
if (duration > 1000) {
  console.warn(`Operation took ${duration}ms`);
}
```

---

## 10. 发布流程

### 10.1 版本号管理

使用语义化版本号：`MAJOR.MINOR.PATCH`

- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修正

### 10.2 发布检查清单

- [ ] 更新版本号（package.json, tauri.conf.json）
- [ ] 更新 CHANGELOG.md
- [ ] 运行所有测试
- [ ] 代码检查（lint, typecheck）
- [ ] 构建测试
- [ ] 签名测试
- [ ] 更新文档
- [ ] 创建 Git Tag
- [ ] 构建正式版本
- [ ] 上传安装包
- [ ] 更新更新服务器

### 10.3 发布脚本

```bash
#!/bin/bash

# 版本号
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh 1.0.0"
  exit 1
fi

# 更新版本号
npm version $VERSION --no-git-tag-version

# 运行测试
pnpm test

# 代码检查
pnpm lint
pnpm typecheck

# 构建
pnpm tauri build

# 创建 Git Tag
git add .
git commit -m "Release v$VERSION"
git tag v$VERSION
git push
git push --tags

echo "Release v$VERSION completed!"
```