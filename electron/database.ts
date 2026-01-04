import { app } from 'electron'
import * as path from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

let dbInitialized = false

export async function setupDatabase() {
  if (dbInitialized) return

  try {
    // Get app data directory
    const userDataPath = app.getPath('appData')
    const appPath = path.join(userDataPath, 'paralegal-ai-assistant')

    // Create directory if it doesn't exist
    if (!existsSync(appPath)) {
      mkdirSync(appPath, { recursive: true })
    }

    // Set DATABASE_URL environment variable for Electron
    const dbPath = path.join(appPath, 'database.db')
    process.env.DATABASE_URL = `file:${dbPath}`

    // Create a simple schema file if it doesn't exist
    const schemaPath = path.join(appPath, 'schema.prisma')
    if (!existsSync(schemaPath)) {
      const schema = `
// This is a minimal schema for the standalone database
// The actual schema is defined in prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`
      writeFileSync(schemaPath, schema.trim())
    }

    dbInitialized = true
    console.log('Database initialized at:', dbPath)
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export function getDatabasePath(): string {
  return process.env.DATABASE_URL || ''
}
