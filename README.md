# JellyTok

![JellyTok Icon](icon.png)

A modern, lightweight web-based media player for Jellyfin that mimics the immersive experience of TikTok. Swipe vertically to browse your media library with ease.

**Language:** [English](README.md) | [中文](README-zh.md)

## 🌐 Live Demo

Try the live demo: [https://jellytok.pages.dev](https://jellytok.pages.dev)

## ✨ Features

- **TikTok-Style Interface**: Vertical swipe gestures to switch between videos.
- **Seamless Playback**:
  - **HLS Support**: Adaptive streaming with transcoding support.
  - **Direct Play**: Option to play files directly without transcoding for supported formats.
  - **Smart Loading**: Optimized buffering strategy to reduce server load.
- **Customizable Experience**:
  - **Quality Control**: Adjust video bitrate or let it auto-adapt.
  - **Filters**: Filter by played status, favorites, or sort by date/random.
  - **Playback Modes**: Toggle "Direct Play First" with automatic fallback to transcoding.
- **Interactive**: Double-tap to like/unlike videos.
- **PWA Support**: Installable as a native-like app on mobile and desktop.
- **Responsive**: Designed for mobile and desktop web.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (with persistence)
- **Video Player**: Native HTML5 Video + hls.js
- **Gestures/Carousel**: Swiper.js
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (install via `npm install -g pnpm`)
- A running Jellyfin server

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mars160/jellytok.git.git
   cd jellytok
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser at `http://localhost:5173`.

### Configuration

1. On first launch, you will be redirected to the **Settings** page.
2. Enter your **Jellyfin Server URL** (e.g., `http://192.168.1.10:8096`).
3. Log in with your Jellyfin username and password.
4. Select the **Library** you want to browse (e.g., Music Videos, Movies).
5. Configure filters and quality settings as desired.
6. Click **Start Watching**!

## 📦 Build

To build the application for production:

```bash
pnpm build
```

The output files will be in the `dist` directory, ready to be deployed to any static file server (Nginx, Apache, Vercel, Netlify, etc.).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source.
