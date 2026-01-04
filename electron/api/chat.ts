import { db } from '../../src/lib/db'
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

async function getZAI() {
  if (!globalForZAI.zai) {
    globalForZAI.zai = await ZAI.create()
  }
  return globalForZAI.zai
}

export async function handleChat(message: string, personality: string, conversationId: string | null) {
  if (!message || !message.trim()) {
    throw new Error('Message is required')
  }

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

  return {
    response: aiResponse,
    conversationId: conversation.id,
    personality: personality
  }
}

export async function getConversation(conversationId: string) {
  if (!conversationId) {
    throw new Error('Conversation ID is required')
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  const messages = JSON.parse(conversation.messages)
  const userMessages = messages.filter((m: any) => m.role !== 'assistant' || messages.indexOf(m) !== 0)

  return {
    messages: userMessages,
    context: conversation.context
  }
}

export async function clearConversation(conversationId: string) {
  if (!conversationId) {
    throw new Error('Conversation ID is required')
  }

  await db.conversation.delete({
    where: { id: conversationId }
  })

  return { message: 'Conversation cleared' }
}
