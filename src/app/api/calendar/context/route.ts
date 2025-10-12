import { NextRequest, NextResponse } from 'next/server'

/**
 * API route to fetch calendar events for the next 2 months to provide context to AI
 * GET /api/calendar/context
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    
    // Calculate time range: from now to 2 months from now
    const now = new Date()
    const twoMonthsFromNow = new Date(now)
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    
    const timeMin = now.toISOString()
    const timeMax = twoMonthsFromNow.toISOString()

    // Fetch events from Google Calendar API
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
        timeMin,
        timeMax,
        maxResults: '250', // Get up to 250 events
        orderBy: 'startTime',
        singleEvents: 'true',
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Calendar API error:', error)
      return NextResponse.json(
        { error: error.error?.message || 'Failed to fetch calendar context' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const events = data.items || []
    
    // Format events for AI context
    const formattedEvents = events.map((event: any) => {
      const start = event.start?.dateTime || event.start?.date
      const end = event.end?.dateTime || event.end?.date
      
      return {
        id: event.id,
        summary: event.summary || 'Không có tiêu đề',
        description: event.description || '',
        start: start,
        end: end,
        location: event.location || '',
        status: event.status,
        isAllDay: !event.start?.dateTime,
      }
    })

    // Create a text summary for AI
    const calendarSummary = formatCalendarSummaryForAI(formattedEvents, now, twoMonthsFromNow)
    
    return NextResponse.json({
      success: true,
      events: formattedEvents,
      summary: calendarSummary,
      totalEvents: formattedEvents.length,
      timeRange: {
        from: timeMin,
        to: timeMax,
      },
    })
  } catch (error) {
    console.error('Error fetching calendar context:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Format calendar events into a text summary for AI
 */
function formatCalendarSummaryForAI(events: any[], startDate: Date, endDate: Date): string {
  if (events.length === 0) {
    return 'Người dùng không có lịch hẹn nào trong 2 tháng tới.'
  }

  const lines: string[] = [
    `THÔNG TIN LỊCH CỦA NGƯỜI DÙNG (từ ${formatDate(startDate)} đến ${formatDate(endDate)}):`,
    `Tổng số sự kiện: ${events.length}`,
    '',
  ]

  // Group events by date
  const eventsByDate: Map<string, any[]> = new Map()
  
  events.forEach(event => {
    const dateKey = event.start.split('T')[0] // Get date part only
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, [])
    }
    eventsByDate.get(dateKey)!.push(event)
  })

  // Sort dates
  const sortedDates = Array.from(eventsByDate.keys()).sort()

  // Format each date's events
  sortedDates.forEach(date => {
    const dateEvents = eventsByDate.get(date)!
    lines.push(`📅 ${formatDate(new Date(date))} (${dateEvents.length} sự kiện):`)
    
    dateEvents.forEach(event => {
      const timeInfo = event.isAllDay 
        ? 'Cả ngày' 
        : `${formatTime(event.start)} - ${formatTime(event.end)}`
      
      lines.push(`  • ${timeInfo}: ${event.summary}`)
      
      if (event.description) {
        lines.push(`    Mô tả: ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}`)
      }
      
      if (event.location) {
        lines.push(`    Địa điểm: ${event.location}`)
      }
    })
    
    lines.push('') // Empty line between dates
  })

  return lines.join('\n')
}

/**
 * Format date to Vietnamese format
 */
function formatDate(date: Date): string {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayName = days[date.getDay()]
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${dayName}, ${day}/${month}/${year}`
}

/**
 * Format time from ISO string
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
