import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// 1. Initialize Redis (Uses your Vercel/Upstash Env Vars)
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
  try {
    // 3. Identify user by IP (works perfectly on Vercel)
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    // 4. Block if they are over the limit
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

    // 5. Normal AI Logic
    const { message } = await req.json()

    const cvContext =
      process.env.GEMINI_API_TEXT ||
      "Imagine you are me. I'm a software developer. You will answer short questions about my self."

    const prompt = `Context:${cvContext}\nUser question: ${message}\n`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://fawredd-portfolio.vercel.app', // Optional. Site URL for rankings on openrouter.ai.
        'X-Title': 'Fawredd portfolio', // Optional. Site title for rankings on openrouter.ai.
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t2-chimera:free',
        prompt: prompt,
        per_request_limits: {
          max_output_tokens: 100,
        },
      }),
    })
    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`)
    }
    const data = await response.json()
    console.log('AI API response data:', JSON.stringify(data))
    const AIreply = data.choices[0].text

    return NextResponse.json({ reply: AIreply })
  } catch (error: unknown) {
    // Log the error for debugging
    console.error('API Error:', error)

    // Handle Google's internal 429 error
    if (error instanceof Error && 'status' in error && error.status === 429) {
      return NextResponse.json({ error: 'AI Busy' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
