# JellyTok

![JellyTok Icon](icon.png)

一个基于 Web 的 Jellyfin 媒体播放器，模仿 TikTok 的沉浸式体验。通过垂直滑动轻松浏览您的媒体库。

**语言:** [English](README.md) | [中文](README-zh.md)

## 🌐 在线演示

体验在线演示：[https://jellytok.pages.dev](https://jellytok.pages.dev)

## ✨ 功能特性

- **TikTok 风格界面**：通过垂直滑动手势在视频之间切换。
- **流畅播放**：
  - **HLS 支持**：支持自适应流媒体和转码。
  - **直接播放 (Direct Play)**：支持直接播放兼容格式的文件，无需转码。
  - **智能加载**：优化的缓冲策略，仅加载当前和相邻视频，减少服务器负载。
- **个性化体验**：
  - **画质控制**：手动调整视频码率或选择自动适应。
  - **过滤器**：按播放状态、收藏状态过滤，或按日期/随机排序。
  - **播放模式**：支持“优先直接播放”，失败时自动回退到转码模式。
- **交互**：双击点赞/取消点赞视频。
- **PWA 支持**：支持作为原生应用安装到移动端和桌面端。
- **响应式设计**：专为移动端和桌面端 Web 设计。

## 🛠️ 技术栈

- **框架**: React 19 + Vite
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **状态管理**: Zustand (带持久化)
- **视频播放器**: 原生 HTML5 Video + hls.js
- **手势/轮播**: Swiper.js
- **图标**: Lucide React

## 🚀 快速开始

### 前置要求

- Node.js 20+
- pnpm (通过 `npm install -g pnpm` 安装)
- 一个运行中的 Jellyfin 服务器

### 安装

1. 克隆仓库：

   ```bash
   git clone https://github.com/Mars160/jellytok.git.git
   cd jellytok
   ```

2. 安装依赖：

   ```bash
   pnpm install
   ```

3. 启动开发服务器：

   ```bash
   pnpm dev
   ```

4. 在浏览器中打开 `http://localhost:5173`。

### 配置

1. 首次启动时，您将被重定向到 **设置 (Settings)** 页面。
2. 输入您的 **Jellyfin 服务器地址** (例如 `http://192.168.1.10:8096`)。
3. 使用您的 Jellyfin 用户名和密码登录。
4. 选择您想要浏览的 **媒体库 (Library)** (例如 音乐视频, 电影)。
5. 根据需要配置过滤器和画质设置。
6. 点击 **开始观看 (Start Watching)**！

## 📦 构建

构建生产环境应用：

```bash
pnpm build
```

输出文件将位于 `dist` 目录中，可以部署到任何静态文件服务器 (Nginx, Apache, Vercel, Netlify 等)。

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

## 📄 许可证

本项目开源。
