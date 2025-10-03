export type TaskStatus = 'pending' | 'scheduled';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  scheduledTime: string; // ISO string
  endTime?: string; // ISO string for task end; optional for legacy tasks
  status: TaskStatus;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}
