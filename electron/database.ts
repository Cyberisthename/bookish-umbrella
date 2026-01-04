import { app } from 'electron'
import * as path from 'path'
import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'

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
    process.env.DATABASE_URL = `file:${path.join(appPath, 'database.db')}`

    // Initialize Prisma database
    const prismaPath = path.join(process.cwd(), 'node_modules', '.bin', 'prisma')

    // Run prisma generate
    await runCommand(prismaPath, ['generate'])

    // Run prisma db push
    await runCommand(prismaPath, ['db', 'push', '--skip-generate'])

    dbInitialized = true
    console.log('Database initialized at:', path.join(appPath, 'database.db'))
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      shell: true,
      stdio: 'inherit'
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

export function getDatabasePath(): string {
  return process.env.DATABASE_URL || ''
}
