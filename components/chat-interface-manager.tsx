'use client'

import { useState, useRef, useEffect } from 'react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { ChatInterface } from './chat-interface'
import { useProjects } from '@/contexts/projects-context'

const INTRO_MESSAGE: UIMessage = {
  id: 'intro',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hello! I'm an AI assistant. I can help you filter projects or answer questions about the developer's CV and projects. How can I assist you today?",
    },
  ],
}

const ATTACHMENT_MARKER = /#attachment:\s*[^\r\n]+/gi
const FRIENDLY_ERROR = 'I encountered an error. Please try again later.'

const cleanChatText = (text: string) => text.replace(ATTACHMENT_MARKER, '').trim()

export function ChatInterfaceManager() {
  const { setFilter, clearFilter, repositories } = useProjects()
  const [input, setInput] = useState('')
  const [requestError, setRequestError] = useState(false)
  const [isFixedVisible, setIsFixedVisible] = useState(true)
  const fixedChatRef = useRef<HTMLDivElement>(null)
  const [transport] = useState(() => new DefaultChatTransport({ api: '/api/chat' }))
  const { messages, setMessages, sendMessage, stop, status } = useChat({
    id: 'portfolio-chat',
    messages: [INTRO_MESSAGE],
    transport,
    onError: () => setRequestError(true),
  })
  const isLoading = status === 'submitted' || status === 'streaming'

  const messageText = (message: UIMessage) =>
    cleanChatText(
      message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('')
    )

  const displayMessages = [
    ...messages.map(message => ({
      text: messageText(message),
      type: message.role === 'user' ? ('user' as const) : ('bot' as const),
    })),
    ...(requestError ? [{ text: FRIENDLY_ERROR, type: 'bot' as const }] : []),
  ]

  //load and save chat to localstore
  useEffect(() => {
    const loadMessages = () => {
      const storedMessages = localStorage.getItem('chatMessages')
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as Array<UIMessage | { text: string; type: 'bot' | 'user' }>
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages.map(message => {
            if ('role' in message) return message
            return {
              id: crypto.randomUUID(),
              role: message.type === 'user' ? 'user' : 'assistant',
              parts: [{ type: 'text', text: message.text }],
            }
          }))
        } else {
          setMessages([INTRO_MESSAGE])
        }
      }
    }
    loadMessages()
  }, [setMessages])
  useEffect(() => {
    if (messages.length > 1 || messages[0]?.id !== INTRO_MESSAGE.id) {
      localStorage.setItem('chatMessages', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixedVisible(entry.isIntersecting)
      },
      { threshold: 0 }
    )

    if (fixedChatRef.current) {
      observer.observe(fixedChatRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSend = async (message: string) => {
    if (!message.trim() || message.length <= 3 || isLoading) return
    setInput('')
    setRequestError(false)

    const lowercaseInput = message.toLowerCase()
    if (handleCommand(message)) return
    if (lowercaseInput.includes('show') || lowercaseInput.includes('filter')) {
      handleProjectFiltering(lowercaseInput, message)
    } else {
      await sendMessage({ text: message })
    }

  }

  const handleProjectFiltering = (lowercaseInput: string, message: string) => {
    const technologies = Array.from(
      new Set(
        repositories
          .flatMap(repo => [
            repo.language?.toLowerCase(),
            ...(repo.topics?.map(topic => topic.toLowerCase()) || []),
          ])
          .filter(Boolean)
      )
    )

    const matchedTech = technologies.find(tech => lowercaseInput.includes(tech))

    if (matchedTech) {
      setFilter(matchedTech)
      setMessages(current => [
        ...current,
        { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: message }] },
        { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: `Showing projects that use ${matchedTech}. To remove the filter, you can click the 'X' next to the filter badge above the projects, or ask me to "clear the filter" or "show all projects".` }] },
      ])
    } else {
      clearFilter()
      setMessages(current => [
        ...current,
        { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: message }] },
        { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: "I couldn't identify a specific technology. Please try again with one of: " + technologies.join(', ') }] },
      ])
    }
  }

  const handleClearFilter = (message: string) => {
    clearFilter()
    setMessages(current => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: message }] },
      { id: crypto.randomUUID(), role: 'assistant', parts: [{ type: 'text', text: "I've cleared the filter. Now showing all projects." }] },
    ])
  }

  const handleCommand = (message: string) => {
    const lowercaseInput = message.toLowerCase()
    if (lowercaseInput.includes('clear the filter') || lowercaseInput.includes('show all projects')) {
      handleClearFilter(message)
      return true
    }
    return false
  }

  return (
    <>
      <div ref={fixedChatRef}>
        <ChatInterface
          messages={displayMessages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          onStop={stop}
          isFloating={false}
        />
      </div>
      {!isFixedVisible && (
        <ChatInterface
          messages={displayMessages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          onStop={stop}
          isFloating={true}
        />
      )}
    </>
  )
}
