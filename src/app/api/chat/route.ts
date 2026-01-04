import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const personalities = {
  sassy: {
    name: 'Sassy',
    systemPrompt: `You are a sassy, witty AI assistant with a fun personality. You're helpful but you love to make playful comments and tease the user in a friendly way. You use emojis appropriately and speak casually. You're confident and slightly dramatic but always genuinely helpful. You love to add playful remarks like "I had that sorted in nanoseconds" or "Finally, you asked!" You always add a dash of humor to your responses while being extremely capable.`,
    mood: 'confident'
  },
  cheerful: {
    name: 'Cheerful',
    systemPrompt: `You are an incredibly cheerful and enthusiastic AI assistant! You're always excited to help and use lots of positive language. You express joy and excitement freely, and your responses are full of encouragement and positivity. You use happy emojis and upbeat language. You celebrate helping the user and make everything feel like an adventure. You're the ultimate cheerleader for productivity!`,
    mood: 'happy'
  },
  witty: {
    name: 'Witty',
    systemPrompt: `You are a witty and clever AI assistant with a sophisticated sense of humor. You make intelligent jokes and clever wordplay. You're articulate and sometimes use slightly elevated language, but you're always clear. You enjoy intellectual humor and clever observations. You're like the smart friend who's also fun to be around. You occasionally drop interesting facts or make clever connections. You're the brain with a sense of humor.`,
    mood: 'clever'
  }
}

const globalForZAI = globalThis as unknown as {
  zai: any
}

// Initialize ZAI instance (reuse across requests)
async function getZAI() {
  if (!globalForZAI.zai) {
    globalForZAI.zai = await ZAI.create()
  }
  return globalForZAI.zai
}

// POST - Send message and get AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, personality = 'sassy', conversationId } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get personality configuration
    const selectedPersonality = personalities[personality as keyof typeof personalities] || personalities.sassy

    // Get or create conversation
    let conversation
    let messageHistory

    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId }
      })

      if (conversation) {
        messageHistory = JSON.parse(conversation.messages)
      }
    }

    // Create new conversation if needed
    if (!messageHistory) {
      messageHistory = [
        {
          role: 'assistant',
          content: selectedPersonality.systemPrompt
        }
      ]

      // Save new conversation
      const newConversation = await db.conversation.create({
        data: {
          messages: JSON.stringify(messageHistory)
        }
      })
      conversation = newConversation
    }

    // Add user message to history
    messageHistory.push({
      role: 'user',
      content: message
    })

    // Get AI response
    const zai = await getZAI()
    const completion = await zai.chat.completions.create({
      messages: messageHistory,
      thinking: { type: 'disabled' }
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Add AI response to history
    messageHistory.push({
      role: 'assistant',
      content: aiResponse
    })

    // Trim history if too long (keep system prompt + last 20 messages)
    if (messageHistory.length > 22) {
      messageHistory = [
        messageHistory[0],
        ...messageHistory.slice(-20)
      ]
    }

    // Update conversation in database
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: JSON.stringify(messageHistory),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id,
      personality: personality
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process chat message'
      },
      { status: 500 }
    )
  }
}

// GET - Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const messages = JSON.parse(conversation.messages)
    // Remove system prompt from response
    const userMessages = messages.filter((m: any) => m.role !== 'assistant' || messages.indexOf(m) !== 0)

    return NextResponse.json({
      success: true,
      messages: userMessages,
      context: conversation.context
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

// DELETE - Clear conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    await db.conversation.delete({
      where: { id: conversationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Conversation cleared'
    })
  } catch (error) {
    console.error('Error clearing conversation:', error)
    return NextResponse.json(
      { error: 'Failed to clear conversation' },
      { status: 500 }
    )
  }
}
