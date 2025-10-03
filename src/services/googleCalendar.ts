import dayjs from 'dayjs';
import type { Task } from '../types/task';
import type { TokenBundle } from '../storage/tokenStorage';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

interface CalendarEventInput {
  calendarId?: string;
  task: Task;
}

const getCalendarEndpoint = (calendarId: string, eventId?: string) =>
  `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events${
    eventId ? `/${encodeURIComponent(eventId)}` : ''
  }`;

const buildEventPayload = (task: Task) => {
  const start = dayjs(task.scheduledTime);
  const end = (() => {
    if (task.endTime) {
      const parsed = dayjs(task.endTime);
      if (parsed.isAfter(start)) {
        return parsed;
      }
    }
    return start.add(1, 'hour');
  })();

  return {
    summary: task.title,
    description: task.notes ?? '',
    start: {
      dateTime: start.toISOString()
    },
    end: {
      dateTime: end.toISOString()
    }
  };
};

export const createCalendarEvent = async (
  token: TokenBundle,
  { calendarId = 'primary', task }: CalendarEventInput
): Promise<string> => {
  const response = await fetch(getCalendarEndpoint(calendarId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildEventPayload(task))
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to create calendar event (status ${response.status}): ${message}`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
};

export const updateCalendarEvent = async (
  token: TokenBundle,
  {
    calendarId = 'primary',
    task
  }: CalendarEventInput
): Promise<string> => {
  if (!task.googleEventId) {
    throw new Error('Cannot update calendar event without googleEventId');
  }

  const response = await fetch(getCalendarEndpoint(calendarId, task.googleEventId), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildEventPayload(task))
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to update calendar event (status ${response.status}): ${message}`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
};

export const upsertCalendarEvent = async (
  token: TokenBundle,
  input: CalendarEventInput
): Promise<string> => {
  if (input.task.googleEventId) {
    return updateCalendarEvent(token, input);
  }
  return createCalendarEvent(token, input);
};
