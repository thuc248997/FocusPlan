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
import { createCalendarEvent } from '../services/googleCalendar';
import { loadTasks, persistTasks } from '../storage/taskStorage';
import type { Task } from '../types/task';
import { useGoogleAuthContext } from './GoogleAuthProvider';

interface AddTaskInput {
  title: string;
  notes?: string;
  scheduledTime: string;
  autoSync?: boolean;
}

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  syncingTaskId: string | null;
  addTask: (input: AddTaskInput) => Promise<void>;
  syncTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
}

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

  const commitTasks = useCallback(async (updater: (prev: Task[]) => Task[]) => {
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
        const eventId = await createCalendarEvent(token, { task });
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

  const value = useMemo(
    () => ({ tasks, loading, syncingTaskId, addTask, syncTask, removeTask }),
    [addTask, loading, removeTask, syncTask, syncingTaskId, tasks]
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
