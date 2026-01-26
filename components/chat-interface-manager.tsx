'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInterface } from './chat-interface'
import { useProjects } from '@/contexts/projects-context'

interface Message {
  text: string
  type: 'bot' | 'user'
}

const INTRO_MESSAGE: Message = {
  text: "Hello! I'm an AI assistant. I can help you filter projects or answer questions about the developer's CV and projects. How can I assist you today?",
  type: 'bot',
}

export function ChatInterfaceManager() {
  const { setFilter, clearFilter, repositories } = useProjects()
  const [messages, setMessages] = useState<Message[]>([INTRO_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFixedVisible, setIsFixedVisible] = useState(true)
  const fixedChatRef = useRef<HTMLDivElement>(null)

  //load and save chat to localstore
  useEffect(() => {
    const loadMessages = () => {
      const storedMessages = localStorage.getItem('chatMessages')
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as Message[]
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages)
        } else {
          setMessages([INTRO_MESSAGE])
        }
      }
    }
    loadMessages()
  }, [])
  useEffect(() => {
    console.log('Storing messages start')
    if (messages.length > 1 || messages[0] !== INTRO_MESSAGE) {
      console.log('Storing messages')
      localStorage.setItem('chatMessages', JSON.stringify(messages))
    }
    console.log('Storing messages end')
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
    console.log('Sending messages')
    setIsLoading(true)

    const newMessages = [...messages, { text: message, type: 'user' as const }]
    console.log('Setting messages from user')
    setMessages(newMessages)

    const lowercaseInput = message.toLowerCase()
    if (lowercaseInput.includes('show') || lowercaseInput.includes('filter')) {
      await handleProjectFiltering(lowercaseInput, newMessages)
    } else {
      await handleAIResponse(message, newMessages)
    }

    setInput('')
    setIsLoading(false)
  }

  const handleProjectFiltering = async (lowercaseInput: string, newMessages: Message[]) => {
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
      newMessages.push({
        text: `Showing projects that use ${matchedTech}. To remove the filter, you can click the 'X' next to the filter badge above the projects, or ask me to "clear the filter" or "show all projects".`,
        type: 'bot',
      })
    } else {
      clearFilter()
      newMessages.push({
        text:
          "I couldn't identify a specific technology. Please try again with one of: " +
          technologies.join(', '),
        type: 'bot',
      })
    }
    console.log('Setting messages from filter')
    setMessages(newMessages)
  }

  const handleAIResponse = async (userInput: string, newMessages: Message[]) => {
    try {
      if (
        userInput.toLowerCase().includes('clear the filter') ||
        userInput.toLowerCase().includes('show all projects')
      ) {
        clearFilter()
        newMessages.push({
          text: "I've cleared the filter. Now showing all projects.",
          type: 'bot',
        })
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }),
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        newMessages.push({ text: data.reply, type: 'bot' })
      }
    } catch (error) {
      //console.error("Error getting AI response:", error)
      newMessages.push({
        text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        type: 'bot',
      })
    }
    console.log('Setting messages from AI')
    setMessages(newMessages)
  }

  return (
    <>
      <div ref={fixedChatRef}>
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          isFloating={false}
        />
      </div>
      {!isFixedVisible && (
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          isFloating={true}
        />
      )}
    </>
  )
}
