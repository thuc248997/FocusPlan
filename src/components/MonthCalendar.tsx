'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { fetchCalendarEvents, fetchCalendarEventsForMonth } from '@/lib/googleCalendar'

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  description?: string
  location?: string
}

export default function MonthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      
      // Calculate date range for the current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
      
      const { events: fetchedEvents } = await fetchCalendarEventsForMonth(
        firstDay.toISOString(),
        lastDay.toISOString()
      )
      setEvents(fetchedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get calendar grid data
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate calendar days
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dayDate = new Date(year, month, day)
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '')
      return eventDate.getDate() === day &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year
    })
  }

  // Get events for the current month
  const getEventsForCurrentMonth = () => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '')
      return eventDate.getMonth() === month &&
             eventDate.getFullYear() === year
    })
  }

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear()
  }

  return (
    <div className="h-full flex flex-col bg-chat-bg text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarIcon size={24} className="text-blue-400" />
          <h2 className="text-xl font-semibold">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Hôm nay
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Đang tải lịch...</div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : []
                return (
                  <div
                    key={index}
                    className={`
                      border border-gray-700 rounded-lg p-2 overflow-hidden
                      ${day ? 'bg-gray-800/50 hover:bg-gray-800 cursor-pointer' : 'bg-transparent'}
                      ${isToday(day || 0) ? 'ring-2 ring-blue-500' : ''}
                      transition-colors
                    `}
                  >
                    {day && (
                      <>
                        <div className={`
                          text-sm font-medium mb-1
                          ${isToday(day) ? 'text-blue-400' : 'text-gray-300'}
                        `}>
                          {day}
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-20">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 truncate"
                              title={event.summary}
                            >
                              {event.summary}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 px-1.5">
                              +{dayEvents.length - 3} thêm
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event count */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
        Tổng số sự kiện trong tháng: <span className="text-white font-medium">{getEventsForCurrentMonth().length}</span>
      </div>
    </div>
  )
}
