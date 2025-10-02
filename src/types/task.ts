export type TaskStatus = 'pending' | 'scheduled';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  scheduledTime: string; // ISO string
  status: TaskStatus;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}
