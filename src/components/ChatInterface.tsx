'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import NewTaskModal from './NewTaskModal'
import EditTaskModal from './EditTaskModal'
import { Chat, Message, Task } from '@/types'
import { generateId } from '@/lib/utils'
import { isGoogleCalendarConnected, syncTaskToCalendar } from '@/lib/googleCalendar'

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)

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

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      const tasksWithDates = parsedTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }))
      setTasks(tasksWithDates)
    }

    // Check calendar connection status
    setIsCalendarConnected(isGoogleCalendarConnected())
  }, [])

  useEffect(() => {
    // Listen for connection changes
    const checkConnection = () => {
      setIsCalendarConnected(isGoogleCalendarConnected())
    }

    window.addEventListener('storage', checkConnection)
    window.addEventListener('focus', checkConnection)

    return () => {
      window.removeEventListener('storage', checkConnection)
      window.removeEventListener('focus', checkConnection)
    }
  }, [])

  useEffect(() => {
    // Save chats to localStorage
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  useEffect(() => {
    // Save tasks to localStorage
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  const handleNewTask = () => {
    setIsTaskModalOpen(true)
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, syncToCalendar: boolean) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([newTask, ...tasks])
    console.log('New task created:', newTask)
    
    // Sync to Google Calendar if requested
    if (syncToCalendar && isCalendarConnected) {
      try {
        const result = await syncTaskToCalendar(taskData)
        console.log('✅ Task synced to Google Calendar:', result)
        alert('✅ Task đã được tạo và đồng bộ lên Google Calendar!')
      } catch (error: any) {
        console.error('❌ Failed to sync task:', error)
        const errorMessage = error?.message || 'Không thể đồng bộ lên Google Calendar'
        alert(`⚠️ Task đã được tạo nhưng gặp lỗi khi đồng bộ:\n\n${errorMessage}`)
        // Update connection status
        setIsCalendarConnected(isGoogleCalendarConnected())
      }
    }
  }

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
      setIsEditTaskModalOpen(true)
    }
  }

  const handleUpdateTask = async (taskId: string, updatedTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, syncToCalendar: boolean) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updatedTaskData,
          updatedAt: new Date(),
        }
      }
      return task
    })
    setTasks(updatedTasks)
    console.log('Task updated:', taskId)

    // Sync to Google Calendar if requested
    if (syncToCalendar && isCalendarConnected) {
      try {
        const result = await syncTaskToCalendar(updatedTaskData)
        console.log('✅ Updated task synced to Google Calendar:', result)
        alert('✅ Task đã được cập nhật và đồng bộ lên Google Calendar!')
      } catch (error: any) {
        console.error('❌ Failed to sync updated task:', error)
        const errorMessage = error?.message || 'Không thể đồng bộ lên Google Calendar'
        alert(`⚠️ Task đã được cập nhật nhưng gặp lỗi khi đồng bộ:\n\n${errorMessage}`)
        // Update connection status
        setIsCalendarConnected(isGoogleCalendarConnected())
      }
    }
  }

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
    setCurrentTaskId(null) // Deselect task when selecting chat
  }

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    setChats(updatedChats)
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }

  const handleSelectTask = (taskId: string) => {
    setCurrentTaskId(taskId)
    setCurrentChatId(null) // Deselect chat when selecting task
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    if (currentTaskId === taskId) {
      setCurrentTaskId(updatedTasks.length > 0 ? updatedTasks[0].id : null)
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
        tasks={tasks}
        currentChatId={currentChatId}
        currentTaskId={currentTaskId}
        onNewChat={handleNewChat}
        onNewTask={handleNewTask}
        onSelectChat={handleSelectChat}
        onSelectTask={handleSelectTask}
        onDeleteChat={handleDeleteChat}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
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
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        isCalendarConnected={isCalendarConnected}
      />
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        task={editingTask}
        onClose={() => {
          setIsEditTaskModalOpen(false)
          setEditingTask(null)
        }}
        onUpdateTask={handleUpdateTask}
        isCalendarConnected={isCalendarConnected}
      />
    </div>
  )
}
