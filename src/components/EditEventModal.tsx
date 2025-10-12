'use client'

import { useState, useEffect } from 'react'
import { X, Save, Trash2 } from 'lucide-react'

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

interface EditEventModalProps {
  isOpen: boolean
  event: CalendarEvent | null
  onClose: () => void
  onUpdateEvent: (eventId: string, updatedData: { summary: string; description: string; date: string; startTime: string; endTime: string }) => void
  onDeleteEvent: (eventId: string) => void
}

export default function EditEventModal({ isOpen, event, onClose, onUpdateEvent, onDeleteEvent }: EditEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Update form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.summary || '')
      setDescription(event.description || '')
      
      // Parse date and time from event
      if (event.start.dateTime) {
        const startDate = new Date(event.start.dateTime)
        const endDate = new Date(event.end.dateTime || event.start.dateTime)
        
        // Format date as YYYY-MM-DD
        setDate(startDate.toISOString().split('T')[0])
        
        // Format times as HH:MM
        setStartTime(startDate.toTimeString().slice(0, 5))
        setEndTime(endDate.toTimeString().slice(0, 5))
      } else if (event.start.date) {
        // All-day event
        setDate(event.start.date)
        setStartTime('00:00')
        setEndTime('23:59')
      }
    }
  }, [event])

  if (!isOpen || !event) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !date || !startTime || !endTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    onUpdateEvent(event.id, {
      summary: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
    })

    onClose()
  }

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa sự kiện này?')) {
      onDeleteEvent(event.id)
      onClose()
    }
  }

  const handleClose = () => {
    // Reset to original event data
    if (event) {
      setTitle(event.summary || '')
      setDescription(event.description || '')
      
      if (event.start.dateTime) {
        const startDate = new Date(event.start.dateTime)
        const endDate = new Date(event.end.dateTime || event.start.dateTime)
        setDate(startDate.toISOString().split('T')[0])
        setStartTime(startDate.toTimeString().slice(0, 5))
        setEndTime(endDate.toTimeString().slice(0, 5))
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Chỉnh Sửa Sự Kiện</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-300 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề sự kiện"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả sự kiện"
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-gray-300 mb-1">
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="event-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-startTime" className="block text-sm font-medium text-gray-300 mb-1">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="event-startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="event-endTime" className="block text-sm font-medium text-gray-300 mb-1">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="event-endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Xóa
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
