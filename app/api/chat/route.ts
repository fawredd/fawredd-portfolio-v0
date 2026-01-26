import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

// 1. Initialize the Rate Limiter (5 requests per 60 seconds)
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function POST(req: Request) {
  // 2. Extract User IP for tracking
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  
  // 3. Check local rate limit BEFORE calling Google
  const { success, remaining, reset } = await ratelimit.limit(`ratelimit_${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: "You are sending messages too fast. Please wait a moment." },
      { 
        status: 429, 
        headers: { "X-RateLimit-Reset": reset.toString() } 
      }
    );
  }

  try {
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const cvContext = process.env.GEMINI_API_TEXT || "Imagine you are me. I'm a software developer. You will answer short questions about my self."
    const prompt = `${cvContext}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    // 4. Handle Google's own 429 gracefully
    if (error.status === 429 || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "AI is currently overloaded. Try again in 30 seconds." },
        { status: 429 }
      );
    }

    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
