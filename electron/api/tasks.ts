import { db } from '../db'
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

export async function getTasks() {
  const tasks = await db.learnedTask.findMany({
    orderBy: [
      { usageCount: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return { tasks }
}

export async function createTask(taskData: { taskDescription: string; taskPattern: any; taskName?: string }) {
  if (!taskData.taskDescription || !taskData.taskPattern) {
    throw new Error('Task description and pattern are required')
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
        content: `Analyze this task pattern and provide a structured JSON description with these keys: steps (array of strings), context (string), estimatedTime (string), complexity (string: simple, moderate, or complex). Task: ${taskData.taskDescription}\nPattern: ${typeof taskData.taskPattern === 'string' ? taskData.taskPattern : JSON.stringify(taskData.taskPattern)}`
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
      name: taskData.taskName || `Task ${Date.now()}`,
      description: taskData.taskDescription,
      pattern: JSON.stringify({
        ...analysis,
        originalPattern: taskData.taskPattern
      })
    }
  })

  return { task, analysis }
}

export async function updateTask(id: string, taskData: { name?: string; description?: string; pattern?: any }) {
  const task = await db.learnedTask.update({
    where: { id },
    data: {
      name: taskData.name,
      description: taskData.description,
      pattern: typeof taskData.pattern === 'string' ? taskData.pattern : JSON.stringify(taskData.pattern),
      updatedAt: new Date()
    }
  })

  return { task }
}

export async function deleteTask(id: string) {
  await db.learnedTask.delete({
    where: { id }
  })

  return { message: 'Task deleted successfully' }
}

export async function executeTask(id: string, context: string, customInstructions: string) {
  const task = await db.learnedTask.findUnique({
    where: { id }
  })

  if (!task) {
    throw new Error('Task not found')
  }

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
    where: { id },
    data: {
      usageCount: { increment: 1 },
      lastUsed: new Date(),
      updatedAt: new Date()
    }
  })

  return {
    result,
    taskId: task.id,
    taskName: task.name,
    executionTime: new Date().toISOString()
  }
}
