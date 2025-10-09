'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Menu } from 'lucide-react'
import { Chat, Message } from '@/types'
import MessageBubble from './MessageBubble'

interface ChatAreaProps {
  chat?: Chat
  onSendMessage: (content: string) => void
  onNewChat: () => void
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function ChatArea({
  chat,
  onSendMessage,
  onNewChat,
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-chat-bg">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 bg-sidebar-bg/50">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-white">
          {chat?.title || 'Chat AI'}
        </h1>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!chat || chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  AI
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                How can I help you today?
              </h2>
              <p className="text-gray-400 mb-8">
                Ask me anything, and I'll do my best to provide helpful and accurate information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Explain quantum computing',
                  'Write a Python function',
                  'Plan a trip to Japan',
                  'Help me learn Spanish',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion)
                      textareaRef.current?.focus()
                    }}
                    className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-left text-sm text-gray-300 transition-colors border border-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-chat-bg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-input-bg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 max-h-40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-3">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
