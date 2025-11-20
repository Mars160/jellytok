# jellytok
A TikTok like App Powered By Jellyfin. Implemented by Gemini 3 Pro.

## Tech Stack

This project is built with:
- **Vite** - Next Generation Frontend Tooling
- **React** - A JavaScript library for building user interfaces
- **TypeScript** - JavaScript with syntax for types
- **pnpm** - Fast, disk space efficient package manager

## Getting Started

### Prerequisites
- Node.js 20+ 
- pnpm (install via `npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

This will start the Vite dev server at `http://localhost:5173/`

### Build

```bash
# Build for production
pnpm build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
# Preview the production build locally
pnpm preview
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## Project Structure

```
jellytok/
├── public/          # Static assets
├── src/            # Source files
│   ├── assets/     # Images, fonts, etc.
│   ├── App.tsx     # Main App component
│   ├── App.css     # App styles
│   ├── main.tsx    # Application entry point
│   └── index.css   # Global styles
├── index.html      # HTML entry point
├── package.json    # Project dependencies and scripts
├── tsconfig.json   # TypeScript configuration
├── vite.config.ts  # Vite configuration
└── eslint.config.js # ESLint configuration
```
