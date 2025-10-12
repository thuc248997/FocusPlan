'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import NewTaskModal from './NewTaskModal'
import EditTaskModal from './EditTaskModal'
import { Message, Task } from '@/types'
import { generateId } from '@/lib/utils'
import { isGoogleCalendarConnected, syncTaskToCalendar, deleteCalendarEvent } from '@/lib/googleCalendar'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)

  useEffect(() => {
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
    // Save tasks to localStorage
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const handleNewTask = () => {
    setIsTaskModalOpen(true)
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, syncToCalendar: boolean) => {
    let calendarEventId: string | undefined = undefined
    
    // Sync to Google Calendar if requested
    if (syncToCalendar && isCalendarConnected) {
      try {
        const result = await syncTaskToCalendar(taskData)
        calendarEventId = result.event?.id
        console.log('✅ Task synced to Google Calendar:', result)
      } catch (error: any) {
        console.error('❌ Failed to sync task:', error)
        const errorMessage = error?.message || 'Không thể đồng bộ lên Google Calendar'
        alert(`⚠️ Gặp lỗi khi đồng bộ lên Calendar:\n\n${errorMessage}`)
        // Update connection status
        setIsCalendarConnected(isGoogleCalendarConnected())
      }
    }
    
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      calendarEventId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([newTask, ...tasks])
    console.log('New task created:', newTask)
    
    if (calendarEventId) {
      alert('✅ Task đã được tạo và đồng bộ lên Google Calendar!')
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
    const currentTask = tasks.find(t => t.id === taskId)
    let newCalendarEventId: string | undefined = updatedTaskData.calendarEventId
    
    // Sync to Google Calendar if requested
    if (syncToCalendar && isCalendarConnected) {
      try {
        // Delete old calendar event if it exists
        if (currentTask?.calendarEventId) {
          await deleteCalendarEvent(currentTask.calendarEventId)
          console.log('🗑️ Old calendar event deleted:', currentTask.calendarEventId)
        }
        
        // Create new calendar event with updated data
        const result = await syncTaskToCalendar(updatedTaskData)
        newCalendarEventId = result.event?.id
        console.log('✅ Updated task synced to Google Calendar:', result)
      } catch (error: any) {
        console.error('❌ Failed to sync updated task:', error)
        const errorMessage = error?.message || 'Không thể đồng bộ lên Google Calendar'
        alert(`⚠️ Gặp lỗi khi đồng bộ lên Calendar:\n\n${errorMessage}`)
        // Update connection status
        setIsCalendarConnected(isGoogleCalendarConnected())
      }
    }
    
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updatedTaskData,
          calendarEventId: newCalendarEventId,
          updatedAt: new Date(),
        }
      }
      return task
    })
    setTasks(updatedTasks)
    console.log('Task updated:', taskId)
    
    if (syncToCalendar && newCalendarEventId) {
      alert('✅ Task đã được cập nhật và đồng bộ lên Google Calendar!')
    }
  }

  const handleNewChat = () => {
    setMessages([]) // Clear current messages to start fresh
  }

  const handleSelectTask = (taskId: string) => {
    setCurrentTaskId(taskId)
  }

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId)
    
    // Delete from Google Calendar if it was synced
    if (taskToDelete?.calendarEventId && isCalendarConnected) {
      try {
        await deleteCalendarEvent(taskToDelete.calendarEventId)
        console.log('🗑️ Calendar event deleted:', taskToDelete.calendarEventId)
      } catch (error: any) {
        console.error('❌ Failed to delete calendar event:', error)
        // Continue with local deletion even if calendar deletion fails
      }
    }
    
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    if (currentTaskId === taskId) {
      setCurrentTaskId(updatedTasks.length > 0 ? updatedTasks[0].id : null)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Add a temporary loading message
    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '🤔 Đang suy nghĩ...',
      timestamp: new Date(),
    }
    setMessages([...updatedMessages, loadingMessage])

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          }))],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      // Replace loading message with actual AI response
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages([...updatedMessages, aiMessage])
    } catch (error: any) {
      console.error('Error getting AI response:', error)
      
      // Replace loading message with error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Lỗi: ${error.message || 'Không thể kết nối với AI. Vui lòng thử lại.'}`,
        timestamp: new Date(),
      }

      setMessages([...updatedMessages, errorMessage])
    }
  }

  return (
    <div className="flex h-full bg-chat-bg">
      <Sidebar
        tasks={tasks}
        currentTaskId={currentTaskId}
        onNewTask={handleNewTask}
        onSelectTask={handleSelectTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatArea
        messages={messages}
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
