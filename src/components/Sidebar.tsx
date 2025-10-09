'use client'

import { useState, useEffect } from 'react'
import { MessageSquarePlus, Menu, X, Trash2, MessageSquare, Calendar, Check } from 'lucide-react'
import { Chat } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { initiateGoogleCalendarAuth, isGoogleCalendarConnected, disconnectGoogleCalendar, getGoogleUserInfo, type GoogleUserInfo } from '@/lib/googleCalendar'

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null)

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      const connected = isGoogleCalendarConnected()
      setIsCalendarConnected(connected)
      if (connected) {
        setUserInfo(getGoogleUserInfo())
      }
    }
    
    checkConnection()
    
    // Listen for storage changes (when tokens are stored)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_calendar_token' || e.key === 'google_user_info') {
        checkConnection()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check on window focus
    window.addEventListener('focus', checkConnection)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', checkConnection)
    }
  }, [])

  const handleCalendarAction = () => {
    if (isCalendarConnected) {
      if (confirm('Are you sure you want to disconnect Google Calendar?')) {
        disconnectGoogleCalendar()
        setIsCalendarConnected(false)
        setUserInfo(null)
      }
    } else {
      initiateGoogleCalendarAuth()
    }
  }

  // Group chats by date
  const groupedChats = chats.reduce((acc, chat) => {
    const dateKey = formatDate(chat.updatedAt)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(chat)
    return acc
  }, {} as Record<string, Chat[]>)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-sidebar-bg flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          !isOpen && 'lg:w-0 lg:opacity-0'
        )}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <MessageSquarePlus size={20} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-3">
          {Object.entries(groupedChats).map(([dateKey, dateChats]) => (
            <div key={dateKey} className="mb-4">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                {dateKey}
              </h3>
              <div className="space-y-1 px-2">
                {dateChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                      currentChatId === chat.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800/50'
                    )}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare size={16} className="flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No chats yet. Start a new conversation!
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {userInfo?.picture ? (
              <img 
                src={userInfo.picture} 
                alt={userInfo.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {userInfo?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {userInfo?.name || 'User'}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {isCalendarConnected ? userInfo?.email || 'Connected' : 'Free Plan'}
              </div>
            </div>
          </div>
          
          {/* Google Calendar Connection */}
          <button
            onClick={handleCalendarAction}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
              isCalendarConnected
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {isCalendarConnected ? (
              <>
                <Check size={18} />
                <span className="font-medium">Calendar Connected</span>
              </>
            ) : (
              <>
                <Calendar size={18} />
                <span className="font-medium">Connect Google Calendar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
