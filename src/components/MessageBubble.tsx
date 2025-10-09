'use client'

import { Message } from '@/types'
import ReactMarkdown from 'react-markdown'
import { User, Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-4 ${
        isUser ? 'bg-transparent' : 'bg-ai-msg/50'
      } px-6 py-6 rounded-lg`}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-green-500 to-blue-500'
          }`}
        >
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-semibold text-white">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className="text-gray-100 markdown">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
