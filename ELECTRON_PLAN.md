# 💻 Electron Desktop App Plan

## Overview

Converting the AI Note-Taking Assistant from a web app to a standalone `.exe` (Windows), `.app` (Mac), and Linux desktop application.

## 🎯 Why Desktop App for Paralegals?

### ✅ Benefits
1. **🔒 Better Privacy** - All data stays on the computer (critical for legal work)
2. **⚡ Offline Mode** - Works without internet (AI features need internet, but notes work offline)
3. **📱 System Integration** - File system access, notifications, auto-start
4. **🎯 Simpler Installation** - Download and run (no servers needed)
5. **💾 Local Database** - SQLite embedded directly in app

### ❌ Challenges
1. **⏰ Time-Consuming** - Requires significant refactoring (8-12 hours of work)
2. **🐛 More Complex** - Harder to debug and maintain
3. **📦 Large File Size** - ~200-300MB download (includes Node.js)
4. **🔄 Updates** - Need to build update mechanism

## 📋 What Needs to Be Done

### Phase 1: Setup & Configuration (2-3 hours)

#### 1.1 Install Electron Dependencies
```bash
bun add electron electron-builder
bun add -D @types/electron
```

#### 1.2 Create Electron Project Structure
```
my-project/
├── electron/
│   ├── main.ts           # Main Electron process
│   ├── preload.ts        # Preload script (security)
│   └── renderer.ts       # Renderer process bridge
├── src/
│   └── (existing Next.js files)
├── package.json          # Updated with Electron config
└── electron-builder.yml  # Build configuration
```

#### 1.3 Configure package.json
```json
{
  "main": "dist-electron/main.js",
  "scripts": {
    "dev:electron": "concurrently \"bun run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build:electron": "bun run build && electron-builder"
  },
  "build": {
    "appId": "com.paralegal.assistant",
    "productName": "Paralegal AI Assistant",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist-electron/**/*",
      ".next/**/*",
      "public/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

### Phase 2: Electron Main Process (2-3 hours)

#### 2.1 Create Main Electron Process (`electron/main.ts`)

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    title: 'Paralegal AI Assistant',
    icon: path.join(__dirname, '../public/icon.png')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC handlers for file system access
ipcMain.handle('save-file', async (event, filePath, content) => {
  const fs = require('fs').promises
  await fs.writeFile(filePath, content, 'utf-8')
  return { success: true }
})

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises
  const content = await fs.readFile(filePath, 'utf-8')
  return content
})

ipcMain.handle('get-app-path', () => {
  return app.getPath('appData')
})
```

#### 2.2 Create Preload Script (`electron/preload.ts`)

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-file', filePath, content),
  readFile: (filePath: string) =>
    ipcRenderer.invoke('read-file', filePath),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
})
```

### Phase 3: Refactor Backend for Electron (3-4 hours)

#### 3.1 Convert API Routes to Local Functions

**Problem**: Electron doesn't have HTTP requests to same app
**Solution**: Use IPC (Inter-Process Communication)

Create `electron/api/` with equivalents of `/api/chat`, `/api/notes`, etc.

```typescript
// electron/api/chat.ts
import ZAI from 'z-ai-web-dev-sdk'

export async function handleChat(message: string, personality: string) {
  const zai = await ZAI.create()
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: getPersonalityPrompt(personality) },
      { role: 'user', content: message }
    ],
    thinking: { type: 'disabled' }
  })
  return completion.choices[0]?.message?.content
}
```

#### 3.2 Update Database Path for Electron

```typescript
// src/lib/db.ts (updated for Electron)
import { PrismaClient } from '@prisma/client'
import { app } from 'electron'

const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer'
const dbPath = isElectron
  ? path.join(app.getPath('appData'), 'paralegal-ai', 'database.db')
  : './db/dev.db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` }
  }
})
```

#### 3.3 Create IPC Handlers for All APIs

```typescript
// electron/handlers.ts
import { ipcMain } from 'electron'
import { handleChat } from './api/chat'
import { createNote, getNotes, deleteNote } from './api/notes'

export function setupIPCHandlers() {
  // Chat
  ipcMain.handle('chat:send', async (event, message, personality) => {
    return await handleChat(message, personality)
  })

  // Notes
  ipcMain.handle('notes:create', async (event, data) => {
    return await createNote(data)
  })

  ipcMain.handle('notes:getAll', async () => {
    return await getNotes()
  })

  ipcMain.handle('notes:delete', async (event, id) => {
    return await deleteNote(id)
  })
}
```

### Phase 4: Update Frontend to Use IPC (2-3 hours)

#### 4.1 Replace API Calls with IPC

**Before (HTTP):**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, personality })
})
```

**After (IPC):**
```typescript
const response = await window.electronAPI.chat(message, personality)
```

#### 4.2 Create Electron Detection

```typescript
// src/lib/detect-electron.ts
export const isElectron = () => {
  return !!(window as any)?.electronAPI
}
```

#### 4.3 Update All API Calls

Update `src/app/page.tsx` to detect Electron and use appropriate method:

```typescript
const sendMessage = async () => {
  if (isElectron()) {
    response = await window.electronAPI.chat(message, personality)
  } else {
    response = await fetch('/api/chat', { method: 'POST', ... })
  }
}
```

### Phase 5: Build & Package (1-2 hours)

#### 5.1 Configure Electron Builder

Create `electron-builder.yml`:

```yaml
appId: com.paralegal.assistant
productName: Paralegal AI Assistant
copyright: Copyright © 2024
directories:
  buildResources: build
  output: release

files:
  - dist-electron/**/*
  - .next/**/*
  - public/**/*

win:
  target:
    - nsis
    - portable
  icon: build/icon.ico

mac:
  target:
    - dmg
    - zip
  icon: build/icon.icns
  category: public.app-category.productivity

linux:
  target:
    - AppImage
    - deb
  icon: build/icon.png
  category: Office
```

#### 5.2 Create Build Script

```json
{
  "scripts": {
    "build:desktop": "bun run build && electron-builder -w -m -l",
    "build:windows": "bun run build && electron-builder -w",
    "build:mac": "bun run build && electron-builder -m",
    "build:linux": "bun run build && electron-builder -l"
  }
}
```

### Phase 6: Testing & Polishing (1-2 hours)

#### 6.1 Test All Features
- [ ] Chat with all personalities
- [ ] Note CRUD operations
- [ ] Reword functionality
- [ ] Task learning
- [ ] File save/load
- [ ] Offline mode
- [ ] Database persistence

#### 6.2 Add User-Friendly Features
- [ ] Auto-start on login
- [ ] System tray icon
- [ ] Minimize to tray
- [ ] Custom app icon
- [ ] Splash screen
- [ ] Auto-update mechanism

## ⏱️ Estimated Timeline

| Phase | Time | Complexity |
|-------|------|------------|
| Setup & Configuration | 2-3 hrs | Medium |
| Electron Main Process | 2-3 hrs | Medium |
| Refactor Backend | 3-4 hrs | High |
| Update Frontend | 2-3 hrs | High |
| Build & Package | 1-2 hrs | Medium |
| Testing & Polishing | 1-2 hrs | Low |
| **Total** | **11-17 hrs** | **High** |

## 🎁 What You Get

### For Windows
- `Paralegal AI Assistant Setup.exe` (~200MB)
- `Paralegal AI Assistant Portable.exe` (~250MB)

### For Mac
- `Paralegal AI Assistant.dmg` (~180MB)

### For Linux
- `Paralegal AI Assistant.AppImage` (~190MB)
- `paralegal-ai-assistant.deb` (~180MB)

## 💡 Alternative: PWA (Progressive Web App)

**Time:** 1-2 hours
**Result:** Installable from browser, works offline

If you want a quicker solution, I can convert this to a PWA instead!

## 🤔 Recommendation

### Choose Desktop App If:
- ✅ Privacy is CRITICAL (legal client data)
- ✅ Need offline access
- ✅ Want single file download
- ✅ Willing to wait 11-17 hours

### Choose Web/PWA If:
- ✅ Want to use it TODAY (2-10 minutes)
- ✅ Access from multiple devices
- ✅ Don't want to wait long
- ✅ Easier to maintain

## 📞 Next Steps

**To proceed with Electron:**
1. Confirm you want to build desktop app
2. I'll start with Phase 1 (Setup)
3. We'll go through each phase together
4. You'll get downloadable .exe at the end

**To deploy web app now:**
1. Follow README.md instructions
2. Deploy to Vercel (takes 5 minutes)
3. Share link with your mom TODAY

**What would you like to do?**
- A) Build Electron desktop app (11-17 hours)
- B) Deploy to Vercel now (5 minutes)
- C) Both - Deploy now, build Electron later

Let me know! 🚀
