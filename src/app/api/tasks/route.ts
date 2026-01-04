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

// GET all learned tasks
export async function GET() {
  try {
    const tasks = await db.learnedTask.findMany({
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      tasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST - Learn a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskDescription, taskPattern, taskName } = body

    if (!taskDescription || !taskPattern) {
      return NextResponse.json(
        { error: 'Task description and pattern are required' },
        { status: 400 }
      )
    }

    // Use AI to analyze and structure the task pattern
    const zai = await getZAI()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are a task analysis expert. Analyze task patterns and provide structured JSON output. Respond ONLY with valid JSON, no additional text.'
        },
        {
          role: 'user',
          content: `Analyze this task pattern and provide a structured JSON description with these keys: steps (array of strings), context (string), estimatedTime (string), complexity (string: simple, moderate, or complex). Task: ${taskDescription}\nPattern: ${typeof taskPattern === 'string' ? taskPattern : JSON.stringify(taskPattern)}`
        }
      ],
      thinking: { type: 'disabled' }
    })

    const analysisText = completion.choices[0]?.message?.content

    if (!analysisText) {
      throw new Error('No response from AI')
    }

    // Parse the analysis (handle potential extra text)
    let analysis
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (e) {
      // Fallback if parsing fails
      analysis = {
        steps: ['Analyze pattern', 'Execute task'],
        context: 'General task execution',
        estimatedTime: 'Unknown',
        complexity: 'moderate'
      }
    }

    // Create learned task
    const task = await db.learnedTask.create({
      data: {
        name: taskName || `Task ${Date.now()}`,
        description: taskDescription,
        pattern: JSON.stringify({
          ...analysis,
          originalPattern: taskPattern
        })
      }
    })

    return NextResponse.json({
      success: true,
      task,
      analysis
    }, { status: 201 })
  } catch (error) {
    console.error('Error learning task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to learn task'
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
