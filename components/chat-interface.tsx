'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2, Maximize2, Minimize2 } from 'lucide-react'

interface Message {
  text: string
  type: 'bot' | 'user'
}

interface ChatInterfaceProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  onSend: (message: string) => void
  onStop: () => void
  error?: string
  isFloating: boolean
}

export function ChatInterface({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onStop,
  error,
  isFloating,
}: ChatInterfaceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const chatBody = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (input.trim() && input.length > 3 && !isLoading) {
      onSend(input)
    }
  }

  useLayoutEffect(() => {
    console.log('Scroll start')
    if (chatBody.current && messages.length > 0) {
      console.log('Start updating scroll')
      chatBody.current.scrollTop = chatBody.current.scrollHeight
    }
    console.log('Scroll finish')
  }, [messages, isLoading, isExpanded])

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isFloating ? 'fixed bottom-4 right-4 z-50 shadow-lg' : 'mx-auto w-full max-w-2xl'} `}
    >
      <Card
        className={` ${isFloating && !isExpanded ? 'h-16 w-24 overflow-hidden' : ''} ${isFloating && isExpanded ? 'w-80' : ''} border-2 bg-white/95 dark:border-green-500 dark:bg-slate-900/85`}
      >
        {isFloating && isExpanded && (
          <div className="absolute right-2 top-2 z-10">
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-2 w-2" />}
            </Button>
          </div>
        )}
        {isFloating && !isExpanded ? (
          <div className="text-primary-foreground flex h-full w-full items-center justify-center">
            <span className="mr-2 text-lg font-bold">AI</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(true)}
              className="text-primary-foreground hover:text-primary-foreground/80 absolute right-1 top-1"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Expand chat</span>
            </Button>
          </div>
        ) : (
          <>
            <CardContent className="space-y-4 p-4">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-medium">AI Assistant</h3>
              </div>
              <div
                ref={chatBody}
                className={`space-y-2 overflow-y-auto text-sm ${isFloating ? 'max-h-[400px]' : 'max-h-[200px]'} `}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`break-words rounded-xl px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'ml-auto mr-2 w-11/12 bg-gray-200/20 text-gray-900 dark:bg-slate-300/20 dark:text-gray-100'
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question or filter projects..."
                  className="flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button
                  onClick={isLoading ? onStop : handleSend}
                  disabled={!isLoading && input.length <= 3}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
