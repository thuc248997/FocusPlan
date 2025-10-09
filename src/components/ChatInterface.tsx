'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import { Chat, Message } from '@/types'
import { generateId } from '@/lib/utils'

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Load chats from localStorage
    const savedChats = localStorage.getItem('chats')
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats)
      // Convert date strings back to Date objects
      const chatsWithDates = parsedChats.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      setChats(chatsWithDates)
      if (chatsWithDates.length > 0) {
        setCurrentChatId(chatsWithDates[0].id)
      }
    }
  }, [])

  useEffect(() => {
    // Save chats to localStorage
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  const handleNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    setChats(updatedChats)
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) {
      handleNewChat()
      return
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages, userMessage]
        const title = chat.messages.length === 0 ? content.slice(0, 50) : chat.title
        return {
          ...chat,
          messages: updatedMessages,
          title,
          updatedAt: new Date(),
        }
      }
      return chat
    })

    setChats(updatedChats)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      }

      const chatsWithAI = updatedChats.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage],
            updatedAt: new Date(),
          }
        }
        return chat
      })

      setChats(chatsWithAI)
    }, 1000)
  }

  const getAIResponse = (userMessage: string): string => {
    // Simple mock AI responses
    const responses = [
      "I'm an AI assistant. I'm here to help you with your questions!",
      "That's an interesting question. Let me think about that...",
      "I understand what you're asking. Here's what I think...",
      "Based on what you've told me, I would suggest...",
      "Great question! Here's a detailed explanation...",
    ]

    // Add some context-aware responses
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! How can I assist you today?"
    }
    if (userMessage.toLowerCase().includes('help')) {
      return "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide helpful answers."
    }
    if (userMessage.toLowerCase().includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?"
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="flex h-full bg-chat-bg">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatArea
        chat={currentChat}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  )
}
