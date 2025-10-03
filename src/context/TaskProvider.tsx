import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Alert } from 'react-native';
import { nanoid } from 'nanoid/non-secure';
import { upsertCalendarEvent } from '../services/googleCalendar';
import { loadTasks, persistTasks } from '../storage/taskStorage';
import type { Task } from '../types/task';
import { useGoogleAuthContext } from './GoogleAuthProvider';

interface AddTaskInput {
  title: string;
  notes?: string;
  scheduledTime: string;
  autoSync?: boolean;
}

/* eslint-disable no-unused-vars */
interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  syncingTaskId: string | null;
  addTask(_input: AddTaskInput): Promise<void>;
  syncTask(_taskId: string): Promise<void>;
  removeTask(_taskId: string): Promise<void>;
  updateTask(_taskId: string, _updates: Partial<Omit<Task, 'id'>>): Promise<void>;
}

type TaskStateUpdater = (tasks: Task[]) => Task[];
/* eslint-enable no-unused-vars */

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null);
  const googleAuth = useGoogleAuthContext();

  useEffect(() => {
    const bootstrap = async () => {
      const stored = await loadTasks();
      setTasks(stored);
      setLoading(false);
    };
    bootstrap().catch((error) => {
      console.warn('Failed to load tasks', error);
      setLoading(false);
    });
  }, []);

  const commitTasks = useCallback(async (updater: TaskStateUpdater) => {
    let nextSnapshot: Task[] = [];
    setTasks((prev) => {
      nextSnapshot = updater(prev);
      return nextSnapshot;
    });
    try {
      await persistTasks(nextSnapshot);
    } catch (error) {
      console.warn('Failed to persist tasks', error);
    }
  }, []);

  const syncTaskInternal = useCallback(
    async (task: Task) => {
      try {
        setSyncingTaskId(task.id);
        const token = await googleAuth.ensureAuthenticated();
        const eventId = await upsertCalendarEvent(token, { task });
        await commitTasks((prev) =>
          prev.map((existing) =>
            existing.id === task.id
              ? {
                  ...existing,
                  googleEventId: eventId,
                  status: 'scheduled',
                  updatedAt: new Date().toISOString()
                }
              : existing
          )
        );
      } catch (error) {
        console.error('Calendar sync failed', error);
        Alert.alert('Sync failed', 'Unable to sync task with Google Calendar.');
        throw error;
      } finally {
        setSyncingTaskId(null);
      }
    },
    [commitTasks, googleAuth]
  );

  const addTask = useCallback(
    async ({ title, notes, scheduledTime, autoSync = true }: AddTaskInput) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: nanoid(),
        title,
        notes,
        scheduledTime,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      await commitTasks((prev) => [...prev, newTask]);

      if (autoSync && googleAuth.isAuthenticated) {
        try {
          await syncTaskInternal(newTask);
        } catch (error) {
          console.warn('Automatic sync failed', error);
        }
      }
    },
    [commitTasks, googleAuth.isAuthenticated, syncTaskInternal]
  );

  const syncTask = useCallback(
    async (taskId: string) => {
      const target = tasks.find((task) => task.id === taskId);
      if (!target) {
        throw new Error('Task not found');
      }
      await syncTaskInternal(target);
    },
    [syncTaskInternal, tasks]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      await commitTasks((prev) => prev.filter((task) => task.id !== taskId));
    },
    [commitTasks]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
      const now = new Date().toISOString();
      await commitTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const scheduledTimeChanged =
            updates.scheduledTime !== undefined && updates.scheduledTime !== task.scheduledTime;
          const titleChanged = updates.title !== undefined && updates.title !== task.title;
          const notesChanged = updates.notes !== undefined && updates.notes !== task.notes;
          const shouldResetStatus = scheduledTimeChanged || titleChanged || notesChanged;

          return {
            ...task,
            ...updates,
            status: shouldResetStatus ? 'pending' : updates.status ?? task.status,
            updatedAt: now
          };
        })
      );
    },
    [commitTasks]
  );

  const value = useMemo(
    () => ({ tasks, loading, syncingTaskId, addTask, syncTask, removeTask, updateTask }),
    [addTask, loading, removeTask, syncTask, syncingTaskId, tasks, updateTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
