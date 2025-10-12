import { NextRequest, NextResponse } from 'next/server'

/**
 * API route to fetch Google Calendar events
 * GET /api/calendar/events
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
    const { searchParams } = new URL(request.url)
    
    // Get query parameters for date range
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = searchParams.get('timeMax')
    const maxResults = searchParams.get('maxResults') || '20'

    // Build query parameters
    const queryParams: Record<string, string> = {
      maxResults,
      orderBy: 'startTime',
      singleEvents: 'true',
      timeMin,
    }
    
    // Add timeMax if provided
    if (timeMax) {
      queryParams.timeMax = timeMax
    }

    // Fetch events from Google Calendar API
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams(queryParams),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to fetch events' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      events: data.items || [],
      summary: data.summary,
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * API route to create a Google Calendar event
 * POST /api/calendar/events
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const body = await request.json()

    // Validate required fields
    if (!body.summary || !body.start || !body.end) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, start, end' },
        { status: 400 }
      )
    }

    // Create event in Google Calendar
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          summary: body.summary,
          description: body.description || '',
          start: {
            dateTime: body.start,
            timeZone: body.timeZone || 'UTC',
          },
          end: {
            dateTime: body.end,
            timeZone: body.timeZone || 'UTC',
          },
          location: body.location || '',
          attendees: body.attendees || [],
          reminders: body.reminders || {
            useDefault: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to create event' },
        { status: response.status }
      )
    }

    const event = await response.json()
    
    return NextResponse.json({
      success: true,
      event,
      message: 'Event created successfully',
    })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
