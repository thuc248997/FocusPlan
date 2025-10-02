import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { useTasks } from '../context/TaskProvider';

export const TaskList = () => {
  const { tasks, syncingTaskId, syncTask, removeTask, loading } = useTasks();

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Loading tasks…</Text>
      </View>
    );
  }

  if (!tasks.length) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No tasks yet. Add your first task above.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const scheduled = dayjs(item.scheduledTime);
        const syncing = syncingTaskId === item.id;
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{scheduled.format('MMM D, YYYY • h:mm A')}</Text>
                {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                <Text
                  style={[
                    styles.status,
                    item.status === 'scheduled' ? styles.statusScheduled : styles.statusPending
                  ]}
                >
                  {item.status === 'scheduled' ? 'Synced with Google Calendar' : 'Pending sync'}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, syncing ? styles.buttonDisabled : styles.buttonPrimary]}
                  onPress={() => {
                    syncTask(item.id).catch((error) => console.warn('Manual sync failed', error));
                  }}
                  disabled={syncing}
                >
                  <Text style={[styles.buttonText, styles.buttonPrimaryText]}>
                    {syncing ? 'Syncing…' : item.status === 'scheduled' ? 'Resync' : 'Sync'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    removeTask(item.id).catch((error) => console.warn('Failed to delete task', error));
                  }}
                >
                  <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
    gap: 16
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.85)',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textBlock: {
    flex: 1,
    marginRight: 16,
    gap: 4
  },
  actions: {
    justifyContent: 'center',
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.7)'
  },
  notes: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.9)',
    marginTop: 4
  },
  status: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600'
  },
  statusPending: {
    color: '#f97316'
  },
  statusScheduled: {
    color: '#22c55e'
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)'
  },
  placeholderText: {
    color: 'rgba(226,232,240,0.7)'
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: 'rgba(79,70,229,0.35)'
  },
  buttonPrimary: {
    backgroundColor: '#6366f1'
  },
  buttonPrimaryText: {
    color: '#f8fafc'
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.5)'
  },
  buttonSecondaryText: {
    color: '#fca5a5'
  },
  buttonText: {
    fontWeight: '600'
  }
});
