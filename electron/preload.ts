import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Chat
  chat: (message: string, personality: string, conversationId: string | null) =>
    ipcRenderer.invoke('chat:send', message, personality, conversationId),

  getConversation: (conversationId: string) =>
    ipcRenderer.invoke('chat:get', conversationId),

  clearConversation: (conversationId: string) =>
    ipcRenderer.invoke('chat:clear', conversationId),

  // Notes
  getNotes: () => ipcRenderer.invoke('notes:get-all'),

  createNote: (noteData: any) =>
    ipcRenderer.invoke('notes:create', noteData),

  updateNote: (id: string, noteData: any) =>
    ipcRenderer.invoke('notes:update', id, noteData),

  deleteNote: (id: string) =>
    ipcRenderer.invoke('notes:delete', id),

  searchNotes: (query: string) =>
    ipcRenderer.invoke('notes:search', query),

  // Reword
  reword: (text: string, style: string, personality: string) =>
    ipcRenderer.invoke('reword:send', text, style, personality),

  getRewordStyles: () =>
    ipcRenderer.invoke('reword:get-styles'),

  // Tasks
  getTasks: () => ipcRenderer.invoke('tasks:get-all'),

  createTask: (taskData: any) =>
    ipcRenderer.invoke('tasks:create', taskData),

  updateTask: (id: string, taskData: any) =>
    ipcRenderer.invoke('tasks:update', id, taskData),

  deleteTask: (id: string) =>
    ipcRenderer.invoke('tasks:delete', id),

  executeTask: (id: string, context: string, customInstructions: string) =>
    ipcRenderer.invoke('tasks:execute', id, context, customInstructions),

  // File System
  showSaveDialog: () =>
    ipcRenderer.invoke('show-save-dialog'),

  showOpenDialog: () =>
    ipcRenderer.invoke('show-open-dialog'),

  // App Info
  getAppVersion: () =>
    ipcRenderer.invoke('get-app-version'),

  getAppPath: () =>
    ipcRenderer.invoke('get-app-path'),

  // App Control
  restartApp: () =>
    ipcRenderer.invoke('restart-app'),

  // Platform detection
  platform: process.platform
})

// Expose isElectron for detection
contextBridge.exposeInMainWorld('isElectron', true)
