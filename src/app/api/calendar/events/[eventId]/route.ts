import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * API route to update a Google Calendar event
 * PATCH /api/calendar/events/[eventId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const eventId = params.eventId
    const body = await request.json()

    const { summary, description, start, end, location, timeZone } = body

    // Prepare event data
    const eventData: any = {
      summary,
      start: {
        dateTime: start,
        timeZone: timeZone || 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: end,
        timeZone: timeZone || 'Asia/Ho_Chi_Minh',
      },
    }

    if (description) {
      eventData.description = description
    }

    if (location) {
      eventData.location = location
    }

    // Update event in Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to update event' },
        { status: response.status }
      )
    }

    const updatedEvent = await response.json()

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    })
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * API route to delete a Google Calendar event
 * DELETE /api/calendar/events/[eventId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const eventId = params.eventId

    // Delete event from Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to delete event' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
