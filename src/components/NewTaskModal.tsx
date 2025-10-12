'use client'

import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { Task } from '@/types'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, syncToCalendar: boolean) => void
  isCalendarConnected: boolean
}

export default function NewTaskModal({ isOpen, onClose, onCreateTask, isCalendarConnected }: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [syncToCalendar, setSyncToCalendar] = useState(false)

  // Auto-check sync checkbox when calendar is connected
  useEffect(() => {
    if (isCalendarConnected && isOpen) {
      setSyncToCalendar(true)
    }
  }, [isCalendarConnected, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !date || !startTime || !endTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    onCreateTask({
      title: title.trim(),
      description: description?.trim() || '',
      date,
      startTime,
      endTime,
    }, syncToCalendar)

    // Reset form
    setTitle('')
    setDescription('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setSyncToCalendar(false)
    onClose()
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setSyncToCalendar(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Tạo Task Mới</h2>
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề task"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Nội dung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết task"
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Sync to Google Calendar */}
          {isCalendarConnected && (
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <input
                type="checkbox"
                id="syncToCalendar"
                checked={syncToCalendar}
                onChange={(e) => setSyncToCalendar(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="syncToCalendar" className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1">
                <Upload size={16} className="text-blue-400" />
                <span>Đồng bộ lên Google Calendar ngay</span>
              </label>
            </div>
          )}
          
          {!isCalendarConnected && (
            <div className="p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg text-sm text-orange-300">
              ℹ️ Kết nối Google Calendar để đồng bộ task tự động
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Tạo Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
