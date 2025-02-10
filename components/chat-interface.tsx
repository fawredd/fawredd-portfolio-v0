"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Maximize2, Minimize2 } from "lucide-react"

interface Message {
  text: string
  type: "bot" | "user"
}

interface ChatInterfaceProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  onSend: (message: string) => void
  isFloating: boolean
}

export function ChatInterface({ messages, input, setInput, isLoading, onSend, isFloating }: ChatInterfaceProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSend = () => {
    if (input.trim() && input.length > 3 && !isLoading) {
      onSend(input)
    }
  }

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isFloating ? "fixed bottom-4 right-4 z-50 shadow-lg" : "w-full max-w-2xl mx-auto"}
      `}
    >
      <Card 
        className={`
          ${isFloating && !isExpanded ? "w-24 h-16 overflow-hidden" : ""}
          ${isFloating && isExpanded ? "w-80" : ""}
          dark:border-green-500 border-2 light:bg-white/90 dark:bg-slate-900/80
        `}
      >
        {isFloating && isExpanded && (
          <div className="absolute top-2 right-2 z-10">
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-2 w-2" />}
            </Button>
          </div>
        )}
        {isFloating && !isExpanded ? (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary-foreground">
            <span className="font-bold text-lg mr-2">AI</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(true)}
              className="absolute top-1 right-1 text-primary-foreground hover:text-primary-foreground/80"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Expand chat</span>
            </Button>
          </div>
        ) : (
          <>
            <CardContent className="p-4 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">AI Assistant</h3>
              </div>
              <div className={`
                space-y-2 overflow-y-auto text-sm
                ${isFloating ? "max-h-[400px]" : "max-h-[200px]"}
              `}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-xl ${
                      message.type === "bot"
                        ? "bg-primary/20 text-primary"
                        : "bg-gray-200/20 dark:bg-slate-300/20 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <div className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or filter projects..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || input.length <= 3}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

