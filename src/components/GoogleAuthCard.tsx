import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useGoogleAuthContext } from '../context/GoogleAuthProvider';
import { PrimaryButton, SecondaryButton } from './buttons';
import { useWeeklyCalendar } from '../hooks/useWeeklyCalendar';

export const GoogleAuthCard = () => {
  const { isAuthenticated, connect, disconnect, initializing, missingClientConfig } = useGoogleAuthContext();
  const { events, loading, error, refresh } = useWeeklyCalendar();

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
    []
  );
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      }),
    []
  );

  const renderEventDay = (start: Date, end: Date, allDay: boolean) => {
    if (!allDay) {
      return dayFormatter.format(start);
    }
    const adjustedEnd = new Date(end);
    adjustedEnd.setMilliseconds(adjustedEnd.getMilliseconds() - 1);
    const startLabel = dayFormatter.format(start);
    const endLabel = dayFormatter.format(adjustedEnd);
    return startLabel === endLabel ? startLabel : `${startLabel} → ${endLabel}`;
  };

  const renderEventTime = (start: Date, end: Date, allDay: boolean) => {
    if (allDay) {
      return 'All day';
    }
    return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Google Calendar</Text>
      <Text style={styles.subtitle}>
        FocusPlan can create events on your Google Calendar when you sync tasks.
      </Text>
      {isAuthenticated ? (
        <>
          <View style={styles.statusRow}>
            <Text style={styles.connected}>Connected with google calender</Text>
            <View style={styles.statusActions}>
              {loading ? (
                <ActivityIndicator size="small" color="#cbd5f5" />
              ) : (
                <SecondaryButton label="Refresh" onPress={refresh} />
              )}
              <SecondaryButton label="Disconnect" onPress={disconnect} />
            </View>
          </View>
          <View style={styles.calendar}>
            <Text style={styles.calendarHeading}>This week&apos;s schedule</Text>
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : events.length === 0 && !loading ? (
              <Text style={styles.empty}>No events scheduled for this week yet.</Text>
            ) : (
              <View style={styles.eventList}>
                {events.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <Text style={styles.eventDay}>
                      {renderEventDay(event.start, event.end, event.allDay)}
                    </Text>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventSummary}>{event.summary}</Text>
                      <Text style={styles.eventTime}>
                        {renderEventTime(event.start, event.end, event.allDay)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton
            label={initializing ? 'Checking…' : 'Connect Google Calendar'}
            onPress={connect}
            disabled={initializing}
          />
          {missingClientConfig ? (
            <Text style={styles.errorMessage}>
              Add a Google OAuth client ID to your environment before connecting.
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.85)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    marginBottom: 16,
    gap: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.7)',
    marginBottom: 4
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  connected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34d399',
    marginRight: 12
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  calendar: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    gap: 12
  },
  calendarHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0'
  },
  error: {
    fontSize: 14,
    color: '#f87171'
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 13,
    color: '#f97316'
  },
  empty: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.7)'
  },
  eventList: {
    gap: 12
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12
  },
  eventDay: {
    minWidth: 110,
    color: 'rgba(226,232,240,0.75)',
    fontSize: 13,
    fontWeight: '600'
  },
  eventDetails: {
    flex: 1,
    gap: 4
  },
  eventSummary: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600'
  },
  eventTime: {
    color: 'rgba(226,232,240,0.7)',
    fontSize: 13
  }
});
