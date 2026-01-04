import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import isDev from 'electron-is-dev'
import { setupIPCHandlers } from './handlers'
import { setupDatabase } from './database'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    title: 'Paralegal AI Assistant',
    backgroundColor: '#faf5ff',
    show: false // Show only when ready to prevent flash
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, start local server and load from it
    const { spawn } = require('child_process')
    const serverProcess = spawn('bun', ['run', 'electron-server'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    })

    // Give server time to start
    setTimeout(() => {
      mainWindow.loadURL('http://127.0.0.1:3000')
    }, 2000)
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App ready handler
app.whenReady().then(async () => {
  // Setup database
  await setupDatabase()

  // Create window
  createWindow()

  // Setup IPC handlers
  setupIPCHandlers()

  // macOS: Create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle file dialog for saving notes
ipcMain.handle('show-save-dialog', async () => {
  if (!mainWindow) return { canceled: true }

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Note',
    defaultPath: 'note.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  return result
})

// Handle file dialog for opening files
ipcMain.handle('show-open-dialog', async () => {
  if (!mainWindow) return { canceled: true }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Note',
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  return result
})

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Get app data path
ipcMain.handle('get-app-path', () => {
  return app.getPath('appData')
})

// Restart app
ipcMain.handle('restart-app', () => {
  app.relaunch()
  app.exit()
})

export { mainWindow }
