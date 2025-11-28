# BitCake 🍰

A modern, unified web interface for Transmission and qBittorrent.

一个现代化的、统一的 Transmission 和 qBittorrent Web 界面。

## ✨ 特性

- 🚀 基于 Vue 3 + TypeScript + Vite 构建
- 🎯 统一接口，同时支持 Transmission 和 qBittorrent
- 📱 响应式设计，完美支持移动端访问
- 🎨 使用 Element Plus 组件库，界面美观现代
- 📊 强大的数据统计与可视化功能
- 🔧 紧凑的布局设计，信息密度更高
- 🌍 支持中文界面

## 📦 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 默认 Transmission 模式
pnpm run dev

# 指定 Transmission 模式
pnpm run dev:transmission

# 指定 qBittorrent 模式
pnpm run dev:qbittorrent
```

**重要**：开发模式使用 Vite 代理，请求会自动转发到配置的后端服务器。详细配置说明请参考 [DEVELOPMENT.md](./DEVELOPMENT.md)

### 代理配置

在开发模式下，可以通过 `.env.development` 文件配置代理：

```env
# Transmission 代理地址
VITE_PROXY_TRANSMISSION_URL=http://10.229.160.54:9091

# qBittorrent 代理地址
VITE_PROXY_QB_URL=http://10.229.160.54:8080
```

**注意**：
- ✅ `VITE_TORRENT_API_BASE` 应使用相对路径（如 `/api/v2`）
- ❌ 不要使用完整 URL，否则会绕过代理直接请求远程服务器

## 🏗️ 构建打包

### 单独构建

```bash
# 构建 Transmission 版本（输出到 dist-transmission/）
pnpm run build:transmission

# 构建 qBittorrent 版本（输出到 dist-qbittorrent/）
pnpm run build:qbittorrent

# 同时构建两个版本
pnpm run build:both
```

### 预览构建结果

```bash
# 预览 Transmission 构建
pnpm run preview:transmission

# 预览 qBittorrent 构建
pnpm run preview:qbittorrent
```

## 🚀 部署

### 部署到 Transmission

1. 构建 Transmission 版本：
   ```bash
   pnpm run build:transmission
   ```

2. 将 `dist-transmission/` 目录内容复制到 Transmission Web UI 目录：
   - **Linux**: `/usr/share/transmission/web/`
   - **macOS**: `/Applications/Transmission.app/Contents/Resources/web/`
   - **Windows**: `C:\Program Files\Transmission\web\`

3. 或在 Transmission 的 `settings.json` 中设置 `web-home` 指向复制的目录

4. 重启 Transmission，访问 Web UI 即可使用新界面

### 部署到 qBittorrent

1. 构建 qBittorrent 版本：
   ```bash
   pnpm run build:qbittorrent
   ```

2. 将 `dist-qbittorrent/` 目录内容复制到自定义 WebUI 目录

3. 在 qBittorrent 设置中启用"使用替代 WebUI"，并指定目录路径

4. 重启 qBittorrent，访问 Web UI（默认 http://localhost:8080）

5. **首次使用**：使用 qBittorrent 的用户名和密码登录（默认用户名：`admin`，密码：`adminadmin`）

### 使用说明

**服务器地址**：
- 构建时已通过环境变量或模式指定，无需手动配置
- 开发时通过代理自动转发
- 部署后通过相对路径访问

**登录认证**：
- **qBittorrent**: 必须提供用户名和密码（使用 qBittorrent 设置的凭据）
- **Transmission**: 如果 Transmission 启用了认证，需要提供凭据；否则可留空

**退出登录**：
- 点击右上角的退出按钮即可注销

## 📖 文档

- [开发指南](./DEVELOPMENT.md) - 详细的开发说明
- [兼容性说明](./COMPATIBILITY.md) - Transmission 和 qBittorrent 兼容性对比
- [状态映射](./STATE_MAPPING.md) - qBittorrent 状态映射规则

## 🔧 环境变量

- `VITE_TORRENT_BACKEND`: 指定后端类型，可选值 `transmission` 或 `qbittorrent`
- `VITE_TORRENT_API_BASE`: 自定义 API 基础路径
- `VITE_PROXY_TRANSMISSION_URL`: Transmission 代理地址（开发用）
- `VITE_PROXY_QB_URL`: qBittorrent 代理地址（开发用）

## 📊 主要功能

- ✅ 种子列表管理（添加、删除、启动、暂停）
- ✅ 种子详情查看（文件列表、Tracker、Peers）
- ✅ 批量操作（批量限速、批量删除）
- ✅ 高级筛选（按状态、Tracker、关键词）
- ✅ 数据统计与可视化图表
- ✅ 全局设置管理（下载、速度、连接、队列等）
- ✅ 实时数据刷新
- ✅ 紧凑的界面设计

## 📝 版本信息

- 后端版本、RPC 速率与磁盘空间显示在顶部导航栏
- WebUI 版本号在 `package.json` 中维护
- 当前版本：0.1.0

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库
- [Transmission](https://transmissionbt.com/) - 轻量级 BT 客户端
- [qBittorrent](https://www.qbittorrent.org/) - 开源 BT 客户端

## 📄 License

MIT License
