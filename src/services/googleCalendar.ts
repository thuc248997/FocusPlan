import Constants from 'expo-constants';
import type { Task } from '../types/task';
import type { TokenBundle } from '../storage/tokenStorage';

type ExtraConfig = {
  websiteUrl?: string;
  websiteUrls?: Record<string, string | undefined> & {
    local?: string;
    production?: string;
  };
};

interface CalendarEventInput {
  calendarId?: string;
  task: Task;
}

const resolveApiBase = () => {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as ExtraConfig;
  const prefer = (...values: (string | undefined)[]) =>
    values
      .map((value) => value?.trim())
      .find((value): value is string => Boolean(value));
  const candidate =
    prefer(extra.websiteUrl, extra.websiteUrls?.production, extra.websiteUrls?.local) ??
    prefer(...Object.values(extra.websiteUrls ?? {})) ??
    'http://localhost:8081';
  const rawBase = candidate;
  return rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
};

const getSyncEndpoint = () => `${resolveApiBase()}/api/sync-task`;

export const upsertCalendarEvent = async (
  token: TokenBundle,
  { calendarId = 'primary', task }: CalendarEventInput
): Promise<string> => {
  const response = await fetch(getSyncEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ calendarId, task })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to sync calendar event (status ${response.status}): ${message}`);
  }

  const json = (await response.json()) as { eventId: string };
  if (!json.eventId) {
    throw new Error('Calendar sync did not return an event ID.');
  }
  return json.eventId;
};
