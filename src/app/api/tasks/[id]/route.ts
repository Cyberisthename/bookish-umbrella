import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const globalForZAI = globalThis as unknown as {
  zai: any
}

async function getZAI() {
  if (!globalForZAI.zai) {
    globalForZAI.zai = await ZAI.create()
  }
  return globalForZAI.zai
}

// GET - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await db.learnedTask.findUnique({
      where: { id: params.id }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// POST - Execute a learned task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await db.learnedTask.findUnique({
      where: { id: params.id }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { context = '', customInstructions = '' } = body

    // Parse the task pattern
    let pattern
    try {
      pattern = JSON.parse(task.pattern)
    } catch (e) {
      pattern = { steps: [task.description] }
    }

    // Use AI to execute the task based on the learned pattern
    const zai = await getZAI()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are a task execution expert. You execute learned tasks based on patterns. Be helpful, efficient, and provide clear results. Use a friendly but professional tone.`
        },
        {
          role: 'user',
          content: `Execute this task based on the learned pattern:\n\nTask Name: ${task.name}\nDescription: ${task.description}\nPattern: ${JSON.stringify(pattern, null, 2)}\n\nContext: ${context}\n\nCustom Instructions: ${customInstructions}\n\nProvide a clear execution result with step-by-step completion status.`
        }
      ],
      thinking: { type: 'disabled' }
    })

    const result = completion.choices[0]?.message?.content

    if (!result) {
      throw new Error('No response from AI')
    }

    // Update usage count and last used timestamp
    await db.learnedTask.update({
      where: { id: params.id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      result,
      taskId: task.id,
      taskName: task.name,
      executionTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error executing task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute task'
      },
      { status: 500 }
    )
  }
}

// PUT - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, pattern } = body

    const task = await db.learnedTask.update({
      where: { id: params.id },
      data: {
        name,
        description,
        pattern: typeof pattern === 'string' ? pattern : JSON.stringify(pattern),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.learnedTask.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
