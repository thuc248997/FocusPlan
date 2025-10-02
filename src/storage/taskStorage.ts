import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types/task';

const STORAGE_KEY = 'focusplan.tasks';

export const loadTasks = async (): Promise<Task[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.warn('Failed to parse stored tasks', error);
    return [];
  }
};

export const persistTasks = async (tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
