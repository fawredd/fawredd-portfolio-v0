import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

// 1. Initialize Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// 2. Create the limiter: Allow 5 requests every 30 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '30 s'),
  analytics: true,
})

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'https://fawredd-portfolio.vercel.app',
    'X-Title': 'Fawredd portfolio',
  },
})

const ATTACHMENT_MARKER = /#attachment:\s*[^\r\n]+/gi

const cleanChatText = (text: string) => text.replace(ATTACHMENT_MARKER, '').trim()

const FRIENDLY_ERROR = 'I encountered an error. Please try again later.'

export async function POST(req: NextRequest) {
  // 3. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  // 4. Parse and validate the message
  const body = await req.json()
  const incomingMessages = (Array.isArray(body.messages) ? body.messages : []) as UIMessage[]
  const sanitizedMessages: UIMessage[] = incomingMessages.map(message => ({
    ...message,
    parts: Array.isArray(message.parts)
      ? message.parts.map(part =>
          part.type === 'text' ? { ...part, text: cleanChatText(part.text) } : part
        )
      : message.parts,
  }))
  const latestMessage = incomingMessages[incomingMessages.length - 1]
  const latestTextPart = latestMessage?.parts.find(part => part.type === 'text')
  let sanitizedMessage =
    typeof body.message === 'string'
      ? cleanChatText(body.message)
      : latestTextPart
        ? cleanChatText(latestTextPart.text)
        : ''
  sanitizedMessage = sanitizedMessage.slice(0, 500)

  if (!sanitizedMessage) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not configured')
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 503 })
  }

  const cvContext =
    process.env.GEMINI_API_TEXT ||
    "Imagine you are me. I'm a software developer. You will answer short questions about my self."

  try {
    const result = streamText({
      model: openrouter('openrouter/free'),
      system: cvContext,
      messages: await convertToModelMessages(sanitizedMessages),
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1000,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 500 })
  }
}
