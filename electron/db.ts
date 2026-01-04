import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import * as path from 'path'
import { existsSync, mkdirSync } from 'fs'

let prisma: PrismaClient | null = null

export function getDatabasePath(): string {
  if (process.type === 'browser') {
    const userDataPath = app.getPath('appData')
    const appPath = path.join(userDataPath, 'paralegal-ai-assistant')
    
    // Create directory if it doesn't exist
    if (!existsSync(appPath)) {
      mkdirSync(appPath, { recursive: true })
    }
    
    return path.join(appPath, 'database.db')
  }
  
  // Fallback for development
  return path.join(__dirname, '../../prisma/dev.db')
}

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const dbPath = getDatabasePath()
    process.env.DATABASE_URL = `file:${dbPath}`
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }
  
  return prisma
}

// Export the client as 'db' to match the API imports
export const db = getPrismaClient()

export async function initializeDatabase() {
  const client = getPrismaClient()
  
  try {
    await client.$connect()
    console.log('Database connected successfully at:', getDatabasePath())
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

export async function closeDatabaseConnection() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
