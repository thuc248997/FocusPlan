export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description: string
  date: string // Format: YYYY-MM-DD
  startTime: string // Format: HH:MM
  endTime: string // Format: HH:MM
  createdAt: Date
  updatedAt: Date
}
