import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Initialize Redis (Uses your Vercel/Upstash Env Vars)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// 2. Create the limiter: Allow 5 requests every 30 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "30 s"),
  analytics: true,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 3. Identify user by IP (works perfectly on Vercel)
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    // 4. Block if they are over the limit
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    // 5. Normal Gemini Logic
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const cvContext = process.env.GEMINI_API_TEXT || "Imagine you are me. I'm a software developer. You will answer short questions about my self."
    const prompt = `${cvContext}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    return NextResponse.json({ reply: text });

  } catch (error: unknown) {
    // Log the error for debugging
    console.error("API Error:", error);

    // Handle Google's internal 429 error
    if (error instanceof Error && 'status' in error && error.status === 429) {
      return NextResponse.json({ error: "AI Busy" }, { status: 429 });
    }
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}