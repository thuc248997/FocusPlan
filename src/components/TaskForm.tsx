import { useEffect, useMemo, useState } from 'react';
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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTasks } from '../context/TaskProvider';
import { PrimaryButton } from './buttons';

dayjs.extend(customParseFormat);

const INITIAL_DURATION_MINUTES = 60;
const MIN_DURATION_MINUTES = 15;

const computeInitialTimes = () => {
  const start = new Date();
  start.setMinutes(start.getMinutes() + INITIAL_DURATION_MINUTES);
  start.setSeconds(0, 0);
  const end = dayjs(start).add(INITIAL_DURATION_MINUTES, 'minute').toDate();
  return { start, end };
};

const ensureEndAfterStart = (start: Date, candidate: Date) => {
  const startMoment = dayjs(start);
  const candidateMoment = dayjs(candidate);
  if (candidateMoment.isAfter(startMoment)) {
    return candidate;
  }
  return startMoment.add(MIN_DURATION_MINUTES, 'minute').toDate();
};

export const TaskForm = () => {
  const { addTask } = useTasks();
  const initialTimes = useMemo(() => computeInitialTimes(), []);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startAt, setStartAt] = useState(initialTimes.start);
  const [endAt, setEndAt] = useState(initialTimes.end);
  const [showPicker, setShowPicker] = useState(false);
  const [activePicker, setActivePicker] = useState<'date' | 'start' | 'end' | null>(null);
  const isInlinePicker = useMemo(() => Platform.OS === 'ios', []);
  const isWeb = Platform.OS === 'web';
  const [webDateInput, setWebDateInput] = useState(() => dayjs(initialTimes.start).format('YYYY-MM-DD'));
  const [webStartInput, setWebStartInput] = useState(() => dayjs(initialTimes.start).format('HH:mm'));
  const [webEndInput, setWebEndInput] = useState(() => dayjs(initialTimes.end).format('HH:mm'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyStartChange = (mode: 'date' | 'time', selected: Date) => {
    setStartAt((current) => {
      const next = new Date(current);
      if (mode === 'date') {
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      } else {
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      }
      setEndAt((currentEnd) => {
        let candidate = new Date(currentEnd);
        if (mode === 'date') {
          candidate.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
        }
        return ensureEndAfterStart(next, candidate);
      });
      return next;
    });
  };

  const applyEndChange = (selected: Date) => {
    const currentStart = startAt;
    setEndAt(() => {
      const next = new Date(currentStart);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      return ensureEndAfterStart(currentStart, next);
    });
  };

  const handlePickerChange = (target: 'date' | 'start' | 'end') =>
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        if (!isInlinePicker) {
          setShowPicker(false);
          setActivePicker(null);
        }
        return;
      }

      if (selected) {
        if (target === 'date') {
          applyStartChange('date', selected);
        } else if (target === 'start') {
          applyStartChange('time', selected);
        } else {
          applyEndChange(selected);
        }
      }

      if (!isInlinePicker) {
        setShowPicker(false);
        setActivePicker(null);
      }
    };

  const displayPicker = (target: 'date' | 'start' | 'end') => {
    if (isWeb) {
      return;
    }
    setActivePicker(target);
    setShowPicker(true);
  };

  useEffect(() => {
    if (!isWeb) {
      return;
    }
    setWebDateInput(dayjs(startAt).format('YYYY-MM-DD'));
    setWebStartInput(dayjs(startAt).format('HH:mm'));
  }, [isWeb, startAt]);

  useEffect(() => {
    if (!isWeb) {
      return;
    }
    setWebEndInput(dayjs(endAt).format('HH:mm'));
  }, [endAt, isWeb]);

  const handleWebInputBlur = (target: 'date' | 'start' | 'end') => {
    if (!isWeb || typeof window === 'undefined') {
      return;
    }
    const format = target === 'date' ? 'YYYY-MM-DD' : 'HH:mm';
    const rawValue = target === 'date' ? webDateInput : target === 'start' ? webStartInput : webEndInput;
    const parsed = dayjs(rawValue, format, true);
    if (!parsed.isValid()) {
      window.alert(
        target === 'date'
          ? 'Ngày không hợp lệ. Vui lòng dùng định dạng YYYY-MM-DD.'
          : 'Giờ không hợp lệ. Vui lòng dùng định dạng HH:mm.'
      );
      if (target === 'date') {
        setWebDateInput(dayjs(startAt).format('YYYY-MM-DD'));
      } else if (target === 'start') {
        setWebStartInput(dayjs(startAt).format('HH:mm'));
      } else {
        setWebEndInput(dayjs(endAt).format('HH:mm'));
      }
      return;
    }
    const nextDate = parsed.toDate();
    if (target === 'date') {
      applyStartChange('date', nextDate);
    } else if (target === 'start') {
      applyStartChange('time', nextDate);
    } else {
      applyEndChange(nextDate);
    }
  };

  const reset = () => {
    setTitle('');
    setNotes('');
    const { start, end } = computeInitialTimes();
    setStartAt(start);
    setEndAt(end);
  };

  const submit = async () => {
    if (!title.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        scheduledTime: startAt.toISOString(),
        endTime: endAt.toISOString()
      });
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
      <View style={styles.rowWrap}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Date</Text>
          {isInlinePicker ? (
            <DateTimePicker
              value={startAt}
              mode="date"
              onChange={handlePickerChange('date')}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
            />
          ) : isWeb ? (
            <TextInput
              style={[styles.pickerField, styles.webInput]}
              value={webDateInput}
              onChangeText={setWebDateInput}
              onBlur={() => handleWebInputBlur('date')}
              placeholder="YYYY-MM-DD"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Pressable
              style={styles.pickerField}
              onPress={() => displayPicker('date')}
            >
              <Text style={styles.value}>{dayjs(startAt).format('DD/MM/YYYY')}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Start time</Text>
          {isInlinePicker ? (
            <DateTimePicker
              value={startAt}
              mode="time"
              onChange={handlePickerChange('start')}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              is24Hour
            />
          ) : isWeb ? (
            <TextInput
              style={[styles.pickerField, styles.webInput]}
              value={webStartInput}
              onChangeText={setWebStartInput}
              onBlur={() => handleWebInputBlur('start')}
              placeholder="HH:mm"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Pressable
              style={styles.pickerField}
              onPress={() => displayPicker('start')}
            >
              <Text style={styles.value}>{dayjs(startAt).format('HH:mm')}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>End time</Text>
          {isInlinePicker ? (
            <DateTimePicker
              value={endAt}
              mode="time"
              onChange={handlePickerChange('end')}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              is24Hour
            />
          ) : isWeb ? (
            <TextInput
              style={[styles.pickerField, styles.webInput]}
              value={webEndInput}
              onChangeText={setWebEndInput}
              onBlur={() => handleWebInputBlur('end')}
              placeholder="HH:mm"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Pressable
              style={styles.pickerField}
              onPress={() => displayPicker('end')}
            >
              <Text style={styles.value}>{dayjs(endAt).format('HH:mm')}</Text>
            </Pressable>
          )}
        </View>
      </View>
      {!isInlinePicker && showPicker && activePicker && Platform.OS !== 'web' ? (
        <DateTimePicker
          value={activePicker === 'end' ? endAt : startAt}
          onChange={handlePickerChange(activePicker)}
          mode={activePicker === 'date' ? 'date' : 'time'}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          is24Hour={activePicker !== 'date'}
        />
      ) : null}
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
  rowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 16
  },
  rowItem: {
    flexGrow: 1,
    minWidth: 120,
    gap: 4
  },
  label: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.65)',
    marginBottom: 4
  },
  pickerField: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center'
  },
  webInput: {
    color: '#f8fafc'
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c4b5fd'
  }
});
