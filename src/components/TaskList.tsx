import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import dayjs from 'dayjs';
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTasks } from '../context/TaskProvider';

const MIN_DURATION_MINUTES = 15;

dayjs.extend(customParseFormat);

const ensureEndAfterStart = (start: Date, candidate: Date) => {
  const startMoment = dayjs(start);
  const candidateMoment = dayjs(candidate);
  if (candidateMoment.isAfter(startMoment)) {
    return candidate;
  }
  return startMoment.add(MIN_DURATION_MINUTES, 'minute').toDate();
};

export const TaskList = () => {
  const { tasks, syncingTaskId, syncTask, removeTask, loading, updateTask } = useTasks();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Date>(new Date());
  const [editEnd, setEditEnd] = useState<Date>(dayjs().add(1, 'hour').toDate());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'date' | 'start' | 'end'>('date');
  const [saving, setSaving] = useState(false);
  const isWeb = Platform.OS === 'web';
  const [webEditDate, setWebEditDate] = useState('');
  const [webEditStartInput, setWebEditStartInput] = useState('');
  const [webEditEndInput, setWebEditEndInput] = useState('');

  const beginEdit = (taskId: string, scheduledTime: string, endTime?: string) => {
    const start = new Date(scheduledTime);
    const endCandidate = endTime ? new Date(endTime) : dayjs(start).add(1, 'hour').toDate();

    setEditingTaskId(taskId);
    setEditStart(start);
    setEditEnd(ensureEndAfterStart(start, endCandidate));
    setShowPicker(false);
    setPickerMode('date');
    setPickerTarget('date');
    if (isWeb) {
      setWebEditDate(dayjs(start).format('YYYY-MM-DD'));
      setWebEditStartInput(dayjs(start).format('HH:mm'));
      setWebEditEndInput(dayjs(endCandidate).format('HH:mm'));
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setShowPicker(false);
    setPickerMode('date');
    setPickerTarget('date');
  };

  const openPicker = (target: 'date' | 'start' | 'end') => {
    if (isWeb) {
      return;
    }
    setPickerTarget(target);
    setPickerMode(target === 'date' ? 'date' : 'time');
    setShowPicker(true);
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) {
      if (Platform.OS !== 'ios') {
        setShowPicker(false);
      }
      return;
    }

    if (pickerTarget === 'date') {
      setEditStart((current) => {
        const next = new Date(current);
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setEditEnd((currentEnd) => {
          const candidate = new Date(currentEnd);
          candidate.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
          return ensureEndAfterStart(next, candidate);
        });
        return next;
      });
    } else if (pickerTarget === 'start') {
      setEditStart((current) => {
        const next = new Date(current);
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setEditEnd((currentEnd) => ensureEndAfterStart(next, currentEnd));
        return next;
      });
    } else {
      setEditEnd(() => {
        const next = new Date(editStart);
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        return ensureEndAfterStart(editStart, next);
      });
    }

    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (!isWeb || !editingTaskId) {
      return;
    }
    setWebEditDate(dayjs(editStart).format('YYYY-MM-DD'));
    setWebEditStartInput(dayjs(editStart).format('HH:mm'));
  }, [editStart, editingTaskId, isWeb]);

  useEffect(() => {
    if (!isWeb || !editingTaskId) {
      return;
    }
    setWebEditEndInput(dayjs(editEnd).format('HH:mm'));
  }, [editEnd, editingTaskId, isWeb]);

  const handleWebEditBlur = (target: 'date' | 'start' | 'end') => {
    if (!isWeb || typeof window === 'undefined') {
      return;
    }
    const value = target === 'date' ? webEditDate : target === 'start' ? webEditStartInput : webEditEndInput;
    const format = target === 'date' ? 'YYYY-MM-DD' : 'HH:mm';
    const parsed = dayjs(value, format, true);
    if (!parsed.isValid()) {
      window.alert(
        target === 'date'
          ? 'Ngày không hợp lệ. Vui lòng dùng định dạng YYYY-MM-DD.'
          : 'Giờ không hợp lệ. Vui lòng dùng định dạng HH:mm.'
      );
      setWebEditDate(dayjs(editStart).format('YYYY-MM-DD'));
      setWebEditStartInput(dayjs(editStart).format('HH:mm'));
      setWebEditEndInput(dayjs(editEnd).format('HH:mm'));
      return;
    }
    if (target === 'date') {
      setEditStart((current) => {
        const updated = new Date(current);
        updated.setFullYear(parsed.year(), parsed.month(), parsed.date());
        setEditEnd((currentEnd) => {
          const candidate = new Date(currentEnd);
          candidate.setFullYear(parsed.year(), parsed.month(), parsed.date());
          return ensureEndAfterStart(updated, candidate);
        });
        return updated;
      });
    } else if (target === 'start') {
      setEditStart((current) => {
        const updated = new Date(current);
        updated.setHours(parsed.hour(), parsed.minute(), 0, 0);
        setEditEnd((currentEnd) => ensureEndAfterStart(updated, currentEnd));
        return updated;
      });
    } else {
      setEditEnd(() => {
        const updated = new Date(editStart);
        updated.setHours(parsed.hour(), parsed.minute(), 0, 0);
        return ensureEndAfterStart(editStart, updated);
      });
    }
  };

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

  const saveEdit = async () => {
    if (!editingTaskId) {
      return;
    }
    setSaving(true);
    try {
      await updateTask(editingTaskId, {
        scheduledTime: editStart.toISOString(),
        endTime: editEnd.toISOString()
      });
      cancelEdit();
    } catch (error) {
      console.warn('Failed to update task', error);
      Alert.alert('Update failed', 'Unable to update the scheduled time. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const scheduled = dayjs(item.scheduledTime);
        const end = item.endTime ? dayjs(item.endTime) : scheduled.add(1, 'hour');
        const syncing = syncingTaskId === item.id;
        const isEditing = editingTaskId === item.id;
        const editDisabled =
          isEditing || saving || (editingTaskId && editingTaskId !== item.id);

        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>
                  {`${scheduled.format('MMM D, YYYY • h:mm A')} — ${end.format('h:mm A')}`}
                </Text>
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
                  style={[
                    styles.button,
                    styles.buttonTertiary,
                    editDisabled ? styles.buttonDisabledTertiary : null
                  ]}
                  onPress={() => beginEdit(item.id, item.scheduledTime, item.endTime)}
                  disabled={editDisabled}
                >
                  <Text style={[styles.buttonText, styles.buttonTertiaryText]}>
                    {isEditing ? 'Editing…' : 'Edit schedule'}
                  </Text>
                </Pressable>
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
            {isEditing ? (
              <View style={styles.editPanel}>
                <View style={styles.editRow}>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Date</Text>
                  {isWeb ? (
                    <TextInput
                      style={styles.editValueInput}
                      value={webEditDate}
                      onChangeText={setWebEditDate}
                      onBlur={() => handleWebEditBlur('date')}
                      placeholder="YYYY-MM-DD"
                      inputMode="text"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <Pressable onPress={() => openPicker('date')}>
                      <Text style={styles.editValue}>{dayjs(editStart).format('MMM D, YYYY')}</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Start</Text>
                  {isWeb ? (
                    <TextInput
                      style={styles.editValueInput}
                      value={webEditStartInput}
                      onChangeText={setWebEditStartInput}
                      onBlur={() => handleWebEditBlur('start')}
                      placeholder="HH:mm"
                      inputMode="text"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <Pressable onPress={() => openPicker('start')}>
                      <Text style={styles.editValue}>{dayjs(editStart).format('h:mm A')}</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>End</Text>
                  {isWeb ? (
                    <TextInput
                      style={styles.editValueInput}
                      value={webEditEndInput}
                      onChangeText={setWebEditEndInput}
                      onBlur={() => handleWebEditBlur('end')}
                      placeholder="HH:mm"
                      inputMode="text"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <Pressable onPress={() => openPicker('end')}>
                      <Text style={styles.editValue}>{dayjs(editEnd).format('h:mm A')}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
              {showPicker && !isWeb ? (
                <DateTimePicker
                  value={pickerTarget === 'end' ? editEnd : editStart}
                  mode={pickerMode}
                  onChange={onPickerChange}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  />
                ) : null}
                <Text style={styles.editHint}>
                  Changes save locally right away. If you were already synced, the calendar event
                  updates automatically.
                </Text>
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.button, styles.buttonGhost]}
                    onPress={cancelEdit}
                    disabled={saving}
                  >
                    <Text style={[styles.buttonText, styles.buttonGhostText]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonPrimary, saving ? styles.buttonDisabled : null]}
                    onPress={saveEdit}
                    disabled={saving}
                  >
                    <Text style={[styles.buttonText, styles.buttonPrimaryText]}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
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
  buttonTertiary: {
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.45)',
    backgroundColor: 'rgba(99,102,241,0.15)'
  },
  buttonTertiaryText: {
    color: '#c7d2fe'
  },
  buttonDisabledTertiary: {
    opacity: 0.5
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.5)'
  },
  buttonSecondaryText: {
    color: '#fca5a5'
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)'
  },
  buttonGhostText: {
    color: '#e2e8f0'
  },
  buttonText: {
    fontWeight: '600'
  },
  editPanel: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
    gap: 12
  },
  editRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap'
  },
  editField: {
    flex: 1,
    minWidth: 120
  },
  editLabel: {
    fontSize: 13,
    color: 'rgba(226,232,240,0.65)',
    marginBottom: 4
  },
  editValueInput: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15,23,42,0.6)',
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '500'
  },
  editValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c4b5fd'
  },
  editHint: {
    fontSize: 12,
    color: 'rgba(226,232,240,0.6)'
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  }
});
