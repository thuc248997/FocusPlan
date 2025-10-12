'use client'

import { useEffect, useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import MonthCalendar from '@/components/MonthCalendar'
import { storeGoogleCalendarTokens, isGoogleCalendarConnected } from '@/lib/googleCalendar'
import { suppressBrowserExtensionErrors } from '@/lib/suppressErrors'
import { Task } from '@/types'

export default function Home() {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sharedTasks, setSharedTasks] = useState<Task[]>([])

  // Suppress browser extension errors
  useEffect(() => {
    suppressBrowserExtensionErrors()
  }, [])

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      const tasksWithDates = parsedTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }))
      setSharedTasks(tasksWithDates)
    }
  }, [])

  // Update shared tasks when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }))
        setSharedTasks(tasksWithDates)
        console.log('📋 Tasks updated:', tasksWithDates.length, 'tasks')
      } else {
        setSharedTasks([])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Poll localStorage for changes more frequently (for same-tab updates)
    const interval = setInterval(() => {
      handleStorageChange()
    }, 500) // Reduced from 1000ms to 500ms for faster updates

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Check for OAuth errors in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')
      
      if (errorParam) {
        let errorMessage = 'Lỗi kết nối Google Calendar'
        switch (errorParam) {
          case 'access_denied':
            errorMessage = 'Bạn đã từ chối quyền truy cập Google Calendar'
            break
          case 'missing_code':
            errorMessage = 'Thiếu mã xác thực từ Google'
            break
          case 'config_error':
            errorMessage = 'Lỗi cấu hình. Vui lòng kiểm tra Client ID và Client Secret trong .env.local'
            break
          case 'oauth_failed':
            errorMessage = 'Không thể kết nối với Google Calendar. Vui lòng kiểm tra Client Secret trong .env.local'
            break
        }
        setError(errorMessage)
        console.error('OAuth Error:', errorParam, errorMessage)
        
        // Clear error from URL after 5 seconds
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname)
          setError(null)
        }, 5000)
        return
      }

      // Handle OAuth callback tokens from URL hash
      if (window.location.hash) {
        const params = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const expiresIn = params.get('expires_in')
        const userEmail = params.get('user_email')
        const userName = params.get('user_name')
        const userPicture = params.get('user_picture')

        if (accessToken) {
          const userInfo = userEmail ? {
            email: userEmail,
            name: userName || '',
            picture: userPicture || '',
          } : undefined

          storeGoogleCalendarTokens(
            accessToken, 
            refreshToken || undefined,
            expiresIn ? parseInt(expiresIn) : undefined,
            userInfo
          )
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Update connection status
          setIsCalendarConnected(true)
          console.log('✅ Google Calendar connected successfully!')
        }
      } else {
        // Check initial connection status
        setIsCalendarConnected(isGoogleCalendarConnected())
      }
    }
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

  return (
    <div className="flex h-screen flex-col">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 m-4 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat View - Left Half or Full Width */}
        <div className={isCalendarConnected ? "w-1/2 border-r border-gray-700" : "w-2/3 border-r border-gray-700"}>
          <ChatInterface />
        </div>
        
        {/* Calendar View - Always show (to display local tasks) */}
        <div className={isCalendarConnected ? "w-1/2" : "w-1/3"}>
          <MonthCalendar tasks={sharedTasks} />
        </div>
      </div>
    </div>
  )
}
