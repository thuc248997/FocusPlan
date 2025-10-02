import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTasks } from '../context/TaskProvider';
import { PrimaryButton } from './buttons';

const INITIAL_DURATION_MINUTES = 60;

export const TaskForm = () => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => {
    const base = new Date();
    base.setMinutes(base.getMinutes() + INITIAL_DURATION_MINUTES);
    base.setSeconds(0, 0);
    return base;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    if (selected) {
      setDate(selected);
    }
  };

  const displayPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const reset = () => {
    setTitle('');
    setNotes('');
  };

  const submit = async () => {
    if (!title.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addTask({ title: title.trim(), notes: notes.trim() || undefined, scheduledTime: date.toISOString() });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Schedule a new focus block</Text>
      <TextInput
        style={styles.input}
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="rgba(226,232,240,0.6)"
        selectionColor="#a855f7"
        cursorColor="#a855f7"
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        placeholderTextColor="rgba(226,232,240,0.6)"
        selectionColor="#a855f7"
        cursorColor="#a855f7"
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Date</Text>
          <Pressable onPress={() => displayPicker('date')}>
            <Text style={styles.value}>{dayjs(date).format('MMM D, YYYY')}</Text>
          </Pressable>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Time</Text>
          <Pressable onPress={() => displayPicker('time')}>
            <Text style={styles.value}>{dayjs(date).format('h:mm A')}</Text>
          </Pressable>
        </View>
      </View>
      {showPicker && (
        <DateTimePicker
          value={date}
          onChange={onChange}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
        />
      )}
      <PrimaryButton
        label={isSubmitting ? 'Adding…' : 'Add Task'}
        onPress={submit}
        disabled={isSubmitting || !title.trim()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    marginBottom: 16,
    gap: 12
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#e2e8f0'
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(15,23,42,0.6)',
    color: '#f8fafc'
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 16
  },
  rowItem: {
    flex: 1
  },
  label: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.65)',
    marginBottom: 4
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c4b5fd',
    paddingVertical: 8
  }
});
