import { ipcMain } from 'electron'
import { handleChat, getConversation, clearConversation } from './api/chat'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
} from './api/notes'
import { handleReword, getRewordStyles } from './api/reword'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  executeTask
} from './api/tasks'

export function setupIPCHandlers() {
  console.log('Setting up IPC handlers...')

  // ===== Chat Handlers =====
  ipcMain.handle('chat:send', async (event, message, personality, conversationId) => {
    try {
      const result = await handleChat(message, personality, conversationId)
      return { success: true, ...result }
    } catch (error) {
      console.error('Chat error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send message' }
    }
  })

  ipcMain.handle('chat:get', async (event, conversationId) => {
    try {
      const result = await getConversation(conversationId)
      return { success: true, ...result }
    } catch (error) {
      console.error('Get conversation error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get conversation' }
    }
  })

  ipcMain.handle('chat:clear', async (event, conversationId) => {
    try {
      await clearConversation(conversationId)
      return { success: true }
    } catch (error) {
      console.error('Clear conversation error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to clear conversation' }
    }
  })

  // ===== Notes Handlers =====
  ipcMain.handle('notes:get-all', async () => {
    try {
      const result = await getNotes()
      return { success: true, ...result }
    } catch (error) {
      console.error('Get notes error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch notes' }
    }
  })

  ipcMain.handle('notes:create', async (event, noteData) => {
    try {
      const result = await createNote(noteData)
      return { success: true, ...result }
    } catch (error) {
      console.error('Create note error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create note' }
    }
  })

  ipcMain.handle('notes:update', async (event, id, noteData) => {
    try {
      const result = await updateNote(id, noteData)
      return { success: true, ...result }
    } catch (error) {
      console.error('Update note error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update note' }
    }
  })

  ipcMain.handle('notes:delete', async (event, id) => {
    try {
      await deleteNote(id)
      return { success: true }
    } catch (error) {
      console.error('Delete note error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete note' }
    }
  })

  ipcMain.handle('notes:search', async (event, query) => {
    try {
      const result = await searchNotes(query)
      return { success: true, ...result }
    } catch (error) {
      console.error('Search notes error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to search notes' }
    }
  })

  // ===== Reword Handlers =====
  ipcMain.handle('reword:send', async (event, text, style, personality) => {
    try {
      const result = await handleReword(text, style, personality)
      return { success: true, ...result }
    } catch (error) {
      console.error('Reword error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to reword text' }
    }
  })

  ipcMain.handle('reword:get-styles', async () => {
    try {
      const result = await getRewordStyles()
      return { success: true, ...result }
    } catch (error) {
      console.error('Get reword styles error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get reword styles' }
    }
  })

  // ===== Tasks Handlers =====
  ipcMain.handle('tasks:get-all', async () => {
    try {
      const result = await getTasks()
      return { success: true, ...result }
    } catch (error) {
      console.error('Get tasks error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch tasks' }
    }
  })

  ipcMain.handle('tasks:create', async (event, taskData) => {
    try {
      const result = await createTask(taskData)
      return { success: true, ...result }
    } catch (error) {
      console.error('Create task error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create task' }
    }
  })

  ipcMain.handle('tasks:update', async (event, id, taskData) => {
    try {
      const result = await updateTask(id, taskData)
      return { success: true, ...result }
    } catch (error) {
      console.error('Update task error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update task' }
    }
  })

  ipcMain.handle('tasks:delete', async (event, id) => {
    try {
      await deleteTask(id)
      return { success: true }
    } catch (error) {
      console.error('Delete task error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete task' }
    }
  })

  ipcMain.handle('tasks:execute', async (event, id, context, customInstructions) => {
    try {
      const result = await executeTask(id, context, customInstructions)
      return { success: true, ...result }
    } catch (error) {
      console.error('Execute task error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to execute task' }
    }
  })

  console.log('IPC handlers set up successfully')
}
