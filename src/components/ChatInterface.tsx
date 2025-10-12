'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import NewTaskModal from './NewTaskModal'
import EditTaskModal from './EditTaskModal'
import { Message, Task } from '@/types'
import { generateId } from '@/lib/utils'
import { isGoogleCalendarConnected, syncTaskToCalendar, deleteCalendarEvent, fetchCalendarContextForAI, checkScheduleConflicts } from '@/lib/googleCalendar'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [calendarContext, setCalendarContext] = useState<any>(null)

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
    // Fetch calendar context when connected
    const loadCalendarContext = async () => {
      if (isCalendarConnected) {
        try {
          const context = await fetchCalendarContextForAI()
          setCalendarContext(context)
          if (context) {
            console.log('📅 Calendar context loaded:', context?.totalEvents, 'events')
          }
        } catch (error) {
          console.error('Failed to load calendar context:', error)
          setCalendarContext(null)
        }
      } else {
        setCalendarContext(null)
      }
    }

    loadCalendarContext()
  }, [isCalendarConnected])

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
    const updatedTasks = [newTask, ...tasks]
    setTasks(updatedTasks)
    
    // Force save to localStorage to trigger immediate update
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    
    console.log('✅ New task created:', newTask)
    console.log('📋 Total tasks:', updatedTasks.length)
    
    if (calendarEventId) {
      alert('✅ Task đã được tạo và đồng bộ lên Google Calendar!')
    } else if (syncToCalendar) {
      alert('⚠️ Task đã được tạo nhưng chưa đồng bộ được lên Google Calendar')
    } else {
      alert('✅ Task đã được tạo! (Chưa đồng bộ lên Google Calendar)')
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
    
    // Force save to localStorage to trigger immediate update
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    
    console.log('✅ Task updated:', taskId)
    
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
        const result = await deleteCalendarEvent(taskToDelete.calendarEventId)
        // Don't log if already deleted (result.message will contain "already deleted")
        if (!result?.message?.includes('already deleted')) {
          console.log('🗑️ Calendar event deleted:', taskToDelete.calendarEventId)
        }
      } catch (error: any) {
        // Only log error if it's not "already deleted" case
        if (!error.message?.includes('already deleted')) {
          console.error('❌ Failed to delete calendar event:', error)
        }
        // Continue with local deletion regardless
      }
    }
    
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    
    // Force save to localStorage to trigger immediate update
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    
    if (currentTaskId === taskId) {
      setCurrentTaskId(updatedTasks.length > 0 ? updatedTasks[0].id : null)
    }
    
    console.log('✅ Task deleted:', taskId)
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
      // Refresh calendar context if connected (in case there are new events)
      let currentCalendarContext = calendarContext
      if (isCalendarConnected) {
        try {
          const freshContext = await fetchCalendarContextForAI()
          if (freshContext) {
            currentCalendarContext = freshContext
            setCalendarContext(freshContext)
          }
        } catch (error) {
          console.warn('Could not refresh calendar context:', error)
        }
      }

      // Call OpenAI API with calendar context
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
          calendarContext: currentCalendarContext,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      // Check if AI wants to perform an action
      if (data.action) {
        switch (data.action) {
          case 'create_task': {
            // Check for schedule conflicts before creating task
            const conflictCheck = await checkScheduleConflicts(
              data.task.date,
              data.task.startTime,
              data.task.endTime,
              tasks
            )
            
            let conflictWarning = ''
            if (conflictCheck.hasConflicts) {
              conflictWarning = `\n\n⚠️ CẢNH BÁO TRÙNG LỊCH:\n${conflictCheck.conflicts.map((c: any) => 
                `- ${c.title} (${c.startTime}-${c.endTime}) [${c.source === 'calendar' ? 'Google Calendar' : 'Task'}]`
              ).join('\n')}\n\n⚠️ Lịch này bị trùng với ${conflictCheck.conflicts.length} sự kiện khác. Bạn có thể chỉnh sửa thời gian hoặc xác nhận tạo task này.`
            }
            
            // Create the task automatically
            const newTask: Task = {
              ...data.task,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            const updatedTasksList = [newTask, ...tasks]
            setTasks(updatedTasksList)
            
            // Force save to localStorage to trigger immediate update
            localStorage.setItem('tasks', JSON.stringify(updatedTasksList))
            
            console.log('✅ Task created from chat:', newTask)
            console.log('📋 Total tasks:', updatedTasksList.length)
            
            // Show AI message with task creation confirmation
            const aiMessage: Message = {
              id: generateId(),
              role: 'assistant',
              content: `✅ ${data.message}\n\n📋 Chi tiết:\n- Tiêu đề: ${data.task.title}\n- Ngày: ${data.task.date}\n- Thời gian: ${data.task.startTime} - ${data.task.endTime}${data.task.description ? `\n- Mô tả: ${data.task.description}` : ''}${conflictWarning}\n\n💡 Task đã được tạo và lưu vào danh sách. Bạn có thể đồng bộ lên Google Calendar từ sidebar hoặc nói "đồng bộ task [tên]".`,
              timestamp: new Date(),
            }
            setMessages([...updatedMessages, aiMessage])
            break
          }
          
          case 'delete_task': {
            // Find and delete matching tasks
            const identifier = data.taskIdentifier.toLowerCase()
            const matchingTasks = tasks.filter(task => 
              task.title.toLowerCase().includes(identifier) ||
              (task.description?.toLowerCase() || '').includes(identifier)
            )
            
            if (matchingTasks.length === 0) {
              const aiMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: `❌ Không tìm thấy task nào có từ khóa "${data.taskIdentifier}".\n\nDanh sách tasks hiện tại:\n${tasks.map(t => `- ${t.title}`).join('\n') || '(Không có task nào)'}`,
                timestamp: new Date(),
              }
              setMessages([...updatedMessages, aiMessage])
            } else if (matchingTasks.length === 1) {
              const taskToDelete = matchingTasks[0]
              
              // Delete from Google Calendar if synced
              if (taskToDelete.calendarEventId && isCalendarConnected) {
                try {
                  await deleteCalendarEvent(taskToDelete.calendarEventId)
                  console.log('🗑️ Calendar event deleted:', taskToDelete.calendarEventId)
                } catch (error) {
                  console.error('❌ Failed to delete calendar event:', error)
                }
              }
              
              // Delete from local tasks
              const updatedTasks = tasks.filter(t => t.id !== taskToDelete.id)
              setTasks(updatedTasks)
              
              // Force save to localStorage to trigger immediate update
              localStorage.setItem('tasks', JSON.stringify(updatedTasks))
              
              const aiMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: `✅ Đã xóa task: "${taskToDelete.title}"\n- Ngày: ${taskToDelete.date}\n- Thời gian: ${taskToDelete.startTime} - ${taskToDelete.endTime}${taskToDelete.calendarEventId ? '\n- ✅ Đã xóa khỏi Google Calendar' : ''}`,
                timestamp: new Date(),
              }
              setMessages([...updatedMessages, aiMessage])
            } else {
              // Multiple matches - ask user to be more specific
              const aiMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: `⚠️ Tìm thấy ${matchingTasks.length} tasks khớp với "${data.taskIdentifier}":\n\n${matchingTasks.map((t, i) => `${i + 1}. ${t.title} (${t.date} ${t.startTime}-${t.endTime})`).join('\n')}\n\nVui lòng chỉ rõ hơn task nào bạn muốn xóa.`,
                timestamp: new Date(),
              }
              setMessages([...updatedMessages, aiMessage])
            }
            break
          }
          
          case 'sync_task': {
            if (!isCalendarConnected) {
              const aiMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: `❌ Bạn chưa kết nối Google Calendar.\n\nVui lòng kết nối Google Calendar từ sidebar để sử dụng tính năng đồng bộ.`,
                timestamp: new Date(),
              }
              setMessages([...updatedMessages, aiMessage])
              break
            }
            
            if (data.syncAll) {
              // Sync all unsynced tasks
              const unsyncedTasks = tasks.filter(t => !t.calendarEventId)
              
              if (unsyncedTasks.length === 0) {
                const aiMessage: Message = {
                  id: generateId(),
                  role: 'assistant',
                  content: `✅ Tất cả tasks đã được đồng bộ lên Google Calendar!\n\n📊 Thống kê:\n- Tổng số tasks: ${tasks.length}\n- Đã đồng bộ: ${tasks.length}\n- Chưa đồng bộ: 0`,
                  timestamp: new Date(),
                }
                setMessages([...updatedMessages, aiMessage])
              } else {
                let syncedCount = 0
                let failedCount = 0
                const syncResults: string[] = []
                
                for (const task of unsyncedTasks) {
                  try {
                    const result = await syncTaskToCalendar(task)
                    
                    // Update task with calendar event ID
                    const updatedTasks = tasks.map(t => 
                      t.id === task.id 
                        ? { ...t, calendarEventId: result.event?.id, updatedAt: new Date() }
                        : t
                    )
                    setTasks(updatedTasks)
                    
                    // Force save to localStorage to trigger immediate update
                    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
                    
                    syncedCount++
                    syncResults.push(`✅ ${task.title}`)
                  } catch (error) {
                    failedCount++
                    syncResults.push(`❌ ${task.title}`)
                    console.error('Failed to sync task:', task.title, error)
                  }
                }
                
                const aiMessage: Message = {
                  id: generateId(),
                  role: 'assistant',
                  content: `📤 Kết quả đồng bộ:\n\n${syncResults.join('\n')}\n\n📊 Tổng kết:\n- Thành công: ${syncedCount}\n- Thất bại: ${failedCount}\n- Tổng: ${unsyncedTasks.length}`,
                  timestamp: new Date(),
                }
                setMessages([...updatedMessages, aiMessage])
              }
            } else {
              // Sync specific task
              const identifier = data.taskIdentifier.toLowerCase()
              const matchingTasks = tasks.filter(task => 
                (task.title.toLowerCase().includes(identifier) ||
                task.description.toLowerCase().includes(identifier)) &&
                !task.calendarEventId
              )
              
              if (matchingTasks.length === 0) {
                const allMatching = tasks.filter(task => 
                  task.title.toLowerCase().includes(identifier) ||
                  task.description.toLowerCase().includes(identifier)
                )
                
                if (allMatching.length > 0 && allMatching.every(t => t.calendarEventId)) {
                  const aiMessage: Message = {
                    id: generateId(),
                    role: 'assistant',
                    content: `✅ Task "${data.taskIdentifier}" đã được đồng bộ lên Google Calendar trước đó rồi!`,
                    timestamp: new Date(),
                  }
                  setMessages([...updatedMessages, aiMessage])
                } else {
                  const aiMessage: Message = {
                    id: generateId(),
                    role: 'assistant',
                    content: `❌ Không tìm thấy task chưa đồng bộ nào có từ khóa "${data.taskIdentifier}".\n\nTasks chưa đồng bộ:\n${tasks.filter(t => !t.calendarEventId).map(t => `- ${t.title}`).join('\n') || '(Không có)'}`,
                    timestamp: new Date(),
                  }
                  setMessages([...updatedMessages, aiMessage])
                }
              } else if (matchingTasks.length === 1) {
                const taskToSync = matchingTasks[0]
                
                try {
                  const result = await syncTaskToCalendar(taskToSync)
                  
                  // Update task with calendar event ID
                  const updatedTasks = tasks.map(t => 
                    t.id === taskToSync.id 
                      ? { ...t, calendarEventId: result.event?.id, updatedAt: new Date() }
                      : t
                  )
                  setTasks(updatedTasks)
                  
                  // Force save to localStorage to trigger immediate update
                  localStorage.setItem('tasks', JSON.stringify(updatedTasks))
                  
                  const aiMessage: Message = {
                    id: generateId(),
                    role: 'assistant',
                    content: `✅ Đã đồng bộ task lên Google Calendar!\n\n📋 Task: ${taskToSync.title}\n- Ngày: ${taskToSync.date}\n- Thời gian: ${taskToSync.startTime} - ${taskToSync.endTime}\n\n🎉 Task đã chuyển sang trạng thái "Đã đồng bộ" (màu xanh lá trong calendar).`,
                    timestamp: new Date(),
                  }
                  setMessages([...updatedMessages, aiMessage])
                } catch (error: any) {
                  const aiMessage: Message = {
                    id: generateId(),
                    role: 'assistant',
                    content: `❌ Lỗi khi đồng bộ task "${taskToSync.title}":\n\n${error.message}\n\nVui lòng thử lại hoặc kết nối lại Google Calendar.`,
                    timestamp: new Date(),
                  }
                  setMessages([...updatedMessages, aiMessage])
                }
              } else {
                // Multiple matches
                const aiMessage: Message = {
                  id: generateId(),
                  role: 'assistant',
                  content: `⚠️ Tìm thấy ${matchingTasks.length} tasks chưa đồng bộ khớp với "${data.taskIdentifier}":\n\n${matchingTasks.map((t, i) => `${i + 1}. ${t.title} (${t.date} ${t.startTime}-${t.endTime})`).join('\n')}\n\nBạn muốn:\n- Đồng bộ một task cụ thể: "đồng bộ [tên task đầy đủ hơn]"\n- Đồng bộ tất cả: "đồng bộ tất cả tasks"`,
                  timestamp: new Date(),
                }
                setMessages([...updatedMessages, aiMessage])
              }
            }
            break
          }
        }
      } else {
        // Normal AI response
        const aiMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        }
        setMessages([...updatedMessages, aiMessage])
      }
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
