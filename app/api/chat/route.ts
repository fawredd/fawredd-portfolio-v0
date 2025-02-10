import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Fetch the CV context from the environment variable
    const cvContext = process.env.GEMINI_API_TEXT || "Imagine you are me. I'm a software developer. You will answer short questions about my self."

    // Combine the CV context with the user's message
    const prompt = `${cvContext}\n\nUser: ${message}\nAI:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error("Error in Gemini AI chat:", error)
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 })
  }
}

