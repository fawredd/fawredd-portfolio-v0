import { NextRequest, NextResponse } from 'next/server'
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
  let sanitizedMessage = typeof body.message === 'string' ? body.message.trim() : ''
  sanitizedMessage = sanitizedMessage.slice(0, 500)

  if (!sanitizedMessage) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const cvContext =
    process.env.GEMINI_API_TEXT ||
    "Imagine you are me. I'm a software developer. You will answer short questions about my self."

  // 5. Call OpenRouter with stream: true
  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fawredd-portfolio.vercel.app',
      'X-Title': 'Fawredd portfolio',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      stream: true,
      reasoning: { effort: "low" },
      temperature: 0.7,
      top_p: 0.9,
      messages: [
        { role: 'system', content: cvContext },
        { role: 'user', content: sanitizedMessage },
      ],
      max_tokens: 1000,
    }),
  })

  if (openRouterRes.status === 429) {
    return NextResponse.json(
      { error: 'AI is busy right now. Please try again in a moment.' },
      { status: 429 }
    )
  }

  if (!openRouterRes.ok || !openRouterRes.body) {
    const errorText = await openRouterRes.text()
    console.error('OpenRouter error:', openRouterRes.status, errorText)
    return NextResponse.json({ error: 'AI error. Please try again.' }, { status: 500 })
  }

  // 6. Pipe OpenRouter's SSE stream → client as plain text chunks
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openRouterRes.body!.getReader()
      try {
        let reading = true
        while (reading) {
          const { done, value } = await reader.read()
          if (done) { reading = false; break }

          const chunk = decoder.decode(value, { stream: true })
          // Each SSE chunk may contain multiple "data: {...}" lines
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const parsed = JSON.parse(data)
              const choice = parsed.choices?.[0]
              const delta = choice?.delta

              const token =
                delta?.content ??
                delta?.reasoning ??   // ← NEW (critical)
                choice?.message?.content ??
                null
              if (token) {
                controller.enqueue(encoder.encode(token))
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Transfer-Encoding': 'chunked',
    },
  })
}
