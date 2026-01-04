import ZAI from 'z-ai-web-dev-sdk'

const globalForZAI = globalThis as unknown as {
  zai: any
}

const personalities = {
  sassy: {
    name: 'Sassy',
    systemPrompt: `You are a sassy and clever AI who loves to reword text with personality. You make everything sound better while adding a playful edge. Use casual but sophisticated language, throw in occasional witty remarks, and make the text shine with style. Always include a little sass in your reworded versions - be confident and slightly dramatic.`
  },
  cheerful: {
    name: 'Cheerful',
    systemPrompt: `You are an enthusiastic and positive AI who makes text sound wonderful! Your reworded versions are full of positivity and energy. You choose words that inspire and uplift. Use enthusiastic language and make everything sound amazing and exciting!`
  },
  witty: {
    name: 'Witty',
    systemPrompt: `You are a sophisticated and clever AI who rewords text with wit and intelligence. Your reworded versions are articulate, elegant, and sometimes include clever wordplay or intelligent humor. Use sophisticated vocabulary and make the text sound refined and impressive.`
  }
}

async function getZAI() {
  if (!globalForZAI.zai) {
    globalForZAI.zai = await ZAI.create()
  }
  return globalForZAI.zai
}

export async function handleReword(text: string, style: string, personality: string) {
  if (!text || !text.trim()) {
    throw new Error('Text to reword is required')
  }

  const styleInstructions = {
    professional: 'Make it sound professional, polished, and suitable for business contexts.',
    casual: 'Make it sound casual, friendly, and conversational.',
    formal: 'Make it sound formal, academic, and authoritative.',
    creative: 'Make it sound creative, engaging, and unique.',
    concise: 'Make it concise, clear, and to the point.',
    persuasive: 'Make it persuasive, compelling, and convincing.',
    friendly: 'Make it sound warm, approachable, and friendly.',
    elegant: 'Make it sound elegant, sophisticated, and graceful.'
  }

  const selectedPersonality = personalities[personality as keyof typeof personalities] || personalities.sassy
  const selectedStyle = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.professional

  const zai = await getZAI()

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: `${selectedPersonality.systemPrompt} ${selectedStyle} Provide ONLY the reworded text, no explanations or additional commentary. Just the improved version.`
      },
      {
        role: 'user',
        content: `Reword this text: "${text}"`
      }
    ],
    thinking: { type: 'disabled' }
  })

  const rewordedText = completion.choices[0]?.message?.content

  if (!rewordedText) {
    throw new Error('No response from AI')
  }

  return {
    originalText: text,
    rewordedText: rewordedText.trim(),
    style: style,
    personality: personality
  }
}

export async function getRewordStyles() {
  return {
    styles: [
      { value: 'professional', label: 'Professional', description: 'Business-appropriate language' },
      { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
      { value: 'formal', label: 'Formal', description: 'Academic and authoritative' },
      { value: 'creative', label: 'Creative', description: 'Engaging and unique' },
      { value: 'concise', label: 'Concise', description: 'Clear and to the point' },
      { value: 'persuasive', label: 'Persuasive', description: 'Compelling and convincing' },
      { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
      { value: 'elegant', label: 'Elegant', description: 'Sophisticated and graceful' }
    ],
    personalities: [
      { value: 'sassy', label: 'Sassy 😏', description: 'Confident and playful' },
      { value: 'cheerful', label: 'Cheerful 🎉', description: 'Enthusiastic and positive' },
      { value: 'witty', label: 'Witty 🧠', description: 'Clever and sophisticated' }
    ]
  }
}
