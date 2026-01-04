const { PrismaClient } = require('@prisma/client')
const { app } = require('electron')
const path = require('path')
const fs = require('fs')

let prisma = null

function getDatabasePath() {
  if (process.type === 'browser') {
    const userDataPath = app.getPath('appData')
    const appPath = path.join(userDataPath, 'paralegal-ai-assistant')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath, { recursive: true })
    }
    
    return path.join(appPath, 'database.db')
  }
  
  // Fallback for non-Electron environments
  return path.join(__dirname, '..', 'prisma', 'dev.db')
}

function getPrismaClient() {
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

async function initializeDatabase() {
  const client = getPrismaClient()
  
  try {
    // Test connection
    await client.$connect()
    console.log('Database connected successfully at:', getDatabasePath())
    
    // Initialize database schema (Prisma will handle this automatically on first use)
    // No explicit migration needed for SQLite in standalone mode
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

async function closeDatabaseConnection() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

module.exports = {
  getDatabasePath,
  getPrismaClient,
  initializeDatabase,
  closeDatabaseConnection
}
