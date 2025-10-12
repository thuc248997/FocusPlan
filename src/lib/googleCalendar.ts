// Google Calendar OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const GOOGLE_REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/auth/callback/google`
  : ''

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

export interface GoogleUserInfo {
  email: string
  name: string
  picture: string
}

/**
 * Initiates Google OAuth flow for calendar access
 */
export function initiateGoogleCalendarAuth() {
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ Google Client ID not configured')
    alert('Lỗi cấu hình: Google Calendar chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_GOOGLE_CLIENT_ID vào file .env.local')
    return
  }

  console.log('🔐 Starting Google OAuth flow...')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', SCOPES.join(' '))
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent')

  console.log('🔗 Redirect URI:', GOOGLE_REDIRECT_URI)
  console.log('📋 Scopes:', SCOPES)

  // Redirect to Google OAuth
  window.location.href = authUrl.toString()
}

/**
 * Check if user is connected to Google Calendar
 */
export function isGoogleCalendarConnected(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('google_calendar_token') !== null
}

/**
 * Disconnect from Google Calendar
 */
export function disconnectGoogleCalendar() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('google_calendar_token')
  localStorage.removeItem('google_calendar_refresh_token')
  localStorage.removeItem('google_user_info')
  localStorage.removeItem('google_token_expiry')
}

/**
 * Store Google Calendar tokens
 */
export function storeGoogleCalendarTokens(
  accessToken: string, 
  refreshToken?: string,
  expiresIn?: number,
  userInfo?: GoogleUserInfo
) {
  if (typeof window === 'undefined') return
  
  console.log('💾 Storing tokens and user info...')
  
  localStorage.setItem('google_calendar_token', accessToken)
  
  if (refreshToken) {
    localStorage.setItem('google_calendar_refresh_token', refreshToken)
  }
  
  if (expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000)
    localStorage.setItem('google_token_expiry', expiryTime.toString())
  }
  
  if (userInfo) {
    localStorage.setItem('google_user_info', JSON.stringify(userInfo))
    console.log('✅ User info stored:', userInfo.email)
  }
  
  console.log('✅ Tokens stored successfully')
}

/**
 * Get stored access token
 */
export function getGoogleCalendarToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('google_calendar_token')
}

/**
 * Get stored user info
 */
export function getGoogleUserInfo(): GoogleUserInfo | null {
  if (typeof window === 'undefined') return null
  const userInfo = localStorage.getItem('google_user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true
  const expiry = localStorage.getItem('google_token_expiry')
  if (!expiry) return true
  return Date.now() > parseInt(expiry)
}

/**
 * Fetch calendar events
 */
export async function fetchCalendarEvents(maxResults: number = 20) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  const response = await fetch('/api/calendar/events', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  return response.json()
}

/**
 * Fetch calendar events for a specific date range (typically a month)
 */
export async function fetchCalendarEventsForMonth(timeMin: string, timeMax: string, maxResults: number = 100) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    maxResults: maxResults.toString(),
  })

  const response = await fetch(`/api/calendar/events?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  return response.json()
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(eventData: {
  summary: string
  description?: string
  start: string
  end: string
  location?: string
  timeZone?: string
}) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create calendar event')
  }

  return response.json()
}

/**
 * Update calendar event
 */
export async function updateCalendarEvent(eventId: string, eventData: {
  summary: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  timeZone?: string
}) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  // Convert date and time to ISO format
  const startDateTime = `${eventData.date}T${eventData.startTime}:00`
  const endDateTime = `${eventData.date}T${eventData.endTime}:00`

  const updateData = {
    summary: eventData.summary,
    description: eventData.description,
    start: startDateTime,
    end: endDateTime,
    location: eventData.location,
    timeZone: eventData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update calendar event')
  }

  return response.json()
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(eventId: string) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete calendar event')
  }

  return response.json()
}

/**
 * Sync task to Google Calendar
 * Converts task format to Google Calendar event format
 */
export async function syncTaskToCalendar(task: {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
}) {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Chưa kết nối với Google Calendar. Vui lòng kết nối lại.')
  }

  // Check if token is expired
  if (isTokenExpired()) {
    throw new Error('Token đã hết hạn. Vui lòng kết nối lại với Google Calendar.')
  }

  // Convert date and time to ISO format
  const startDateTime = `${task.date}T${task.startTime}:00`
  const endDateTime = `${task.date}T${task.endTime}:00`

  const eventData = {
    summary: task.title,
    description: task.description,
    start: startDateTime,
    end: endDateTime,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  try {
    return await createCalendarEvent(eventData)
  } catch (error: any) {
    // If authentication error, suggest reconnecting
    if (error.message?.includes('authentication') || error.message?.includes('OAuth')) {
      disconnectGoogleCalendar()
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng kết nối lại với Google Calendar.')
    }
    throw error
  }
}

/**
 * Fetch user calendars
 */
export async function fetchUserCalendars() {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    throw new Error('Not connected to Google Calendar')
  }

  const response = await fetch('/api/calendar/list', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendars')
  }

  return response.json()
}

/**
 * Fetch calendar context for AI (next 2 months of events)
 */
export async function fetchCalendarContextForAI() {
  const token = getGoogleCalendarToken()
  
  if (!token) {
    return null // Return null if not connected, don't throw error
  }

  try {
    const response = await fetch('/api/calendar/context', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.warn('Failed to fetch calendar context for AI')
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching calendar context:', error)
    return null
  }
}
