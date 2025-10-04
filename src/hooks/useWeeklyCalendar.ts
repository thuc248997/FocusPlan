import { useCallback, useEffect, useState } from 'react';
import { useGoogleAuthContext } from '../context/GoogleAuthProvider';

type GoogleEventDate = {
  date?: string;
  dateTime?: string;
};

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  start?: GoogleEventDate;
  end?: GoogleEventDate;
};

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[];
};

type WeeklyEvent = {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars';

const toLocalDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return new Date(value);
  }
  return new Date(year, month - 1, day);
};

const resolveWeekRange = () => {
  const now = new Date();
  const start = new Date(now);

  // Align to Monday as the first day of the week to match most productivity workflows.
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
  };
};

const parseEvent = (entry: GoogleCalendarEvent): WeeklyEvent | null => {
  const rawStart = entry.start?.dateTime ?? entry.start?.date;
  if (!rawStart) {
    return null;
  }

  const rawEnd =
    entry.end?.dateTime ??
    entry.end?.date ??
    entry.start?.dateTime ??
    entry.start?.date ??
    rawStart;

  const allDay = Boolean(entry.start?.date && !entry.start?.dateTime);
  const start = allDay ? toLocalDate(rawStart) : new Date(rawStart);
  const end = allDay ? toLocalDate(rawEnd) : new Date(rawEnd);

  if (Number.isNaN(start.getTime())) {
    return null;
  }
  if (Number.isNaN(end.getTime())) {
    end.setTime(start.getTime() + 60 * 60 * 1000);
  }

  return {
    id: entry.id ?? `${rawStart}-${entry.summary ?? 'event'}`,
    summary: entry.summary?.trim() || 'Untitled event',
    start,
    end,
    allDay
  };
};

export const useWeeklyCalendar = () => {
  const { isAuthenticated, ensureAuthenticated } = useGoogleAuthContext();
  const [events, setEvents] = useState<WeeklyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const token = await ensureAuthenticated();
    const { timeMin, timeMax } = resolveWeekRange();
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
      showDeleted: 'false'
    });
    const endpoint = `${CALENDAR_BASE}/primary/events?${params.toString()}`;
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    });

    if (!response.ok) {
      let message = `Google Calendar request failed (${response.status})`;
      try {
        const payload = await response.json();
        message = (payload as { error?: { message?: string } }).error?.message ?? message;
      } catch (parseError) {
        console.warn('Failed to parse Google Calendar error response', parseError);
      }
      throw new Error(message);
    }

    const json = (await response.json()) as GoogleCalendarResponse;
    const items = (json.items ?? [])
      .map(parseEvent)
      .filter((value): value is WeeklyEvent => Boolean(value));

    items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return items;
  }, [ensureAuthenticated]);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (loadError) {
      console.warn('Failed to load weekly Google Calendar events', loadError);
      setError('Unable to load this week\'s calendar.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!isAuthenticated) {
        setEvents([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents();
        if (!cancelled) {
          setEvents(data);
        }
      } catch (hydrateError) {
        if (!cancelled) {
          console.warn('Failed to hydrate weekly Google Calendar events', hydrateError);
          setError('Unable to load this week\'s calendar.');
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    hydrate().catch((error) => console.warn('Weekly calendar hydration failed', error));

    return () => {
      cancelled = true;
    };
  }, [fetchEvents, isAuthenticated]);

  return {
    events,
    loading,
    error,
    refresh: load
  };
};

export type { WeeklyEvent };
