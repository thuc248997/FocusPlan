/* eslint-env node */
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TaskPayload {
  id: string;
  title: string;
  notes?: string;
  scheduledTime: string;
  endTime?: string;
  googleEventId?: string;
}

interface SyncRequestBody {
  task?: TaskPayload;
  calendarId?: string;
}

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars';

const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const allowedOrigin = normalizeBaseUrl(process.env.CORS_ORIGIN) ?? '*';

const withCors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
};

const ensureIso = (value: string | undefined, label: string): string => {
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid ISO date string.`);
  }
  return date.toISOString();
};

const resolveEndTime = (startIso: string, endIso?: string) => {
  if (endIso) {
    const end = new Date(endIso);
    const start = new Date(startIso);
    if (!Number.isNaN(end.getTime()) && end > start) {
      return end.toISOString();
    }
  }
  const fallback = new Date(startIso);
  fallback.setHours(fallback.getHours() + 1);
  return fallback.toISOString();
};

const buildEventPayload = (task: TaskPayload) => {
  const start = ensureIso(task.scheduledTime, 'scheduledTime');
  const end = resolveEndTime(start, task.endTime);

  return {
    summary: task.title,
    description: task.notes ?? '',
    start: { dateTime: start },
    end: { dateTime: end }
  };
};

const upsertCalendarEvent = async (
  accessToken: string,
  task: TaskPayload,
  calendarId = 'primary'
) => {
  const baseEndpoint = `${CALENDAR_BASE}/${encodeURIComponent(calendarId)}/events`;
  const hasExistingEvent = Boolean(task.googleEventId);
  const endpoint = hasExistingEvent
    ? `${baseEndpoint}/${encodeURIComponent(task.googleEventId as string)}`
    : baseEndpoint;

  const response = await fetch(endpoint, {
    method: hasExistingEvent ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildEventPayload(task))
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Google Calendar API request failed (status ${response.status}): ${message}`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  withCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    res.status(401).json({ error: 'Access token is required' });
    return;
  }

  const rawBody = req.body;
  let body: SyncRequestBody;
  try {
    body = (typeof rawBody === 'string'
      ? (rawBody ? JSON.parse(rawBody) : {})
      : rawBody ?? {}) as SyncRequestBody;
  } catch (error) {
    res.status(400).json({ error: `Invalid JSON body: ${(error as Error).message}` });
    return;
  }
  if (!body.task) {
    res.status(400).json({ error: 'Task payload is required' });
    return;
  }

  if (!body.task.title) {
    res.status(400).json({ error: 'Task title is required' });
    return;
  }

  try {
    const eventId = await upsertCalendarEvent(accessToken, body.task, body.calendarId);
    res.status(200).json({ eventId });
  } catch (error) {
    console.error('Sync failed', error);
    res.status(502).json({ error: (error as Error).message });
  }
};

export default handler;
