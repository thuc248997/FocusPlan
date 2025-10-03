import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import dayjs from 'dayjs';
import { useTasks } from '../context/TaskProvider';
import type { Task } from '../types/task';
import {
  AssistantMessage,
  invokeSchedulerAssistant
} from '../services/schedulerAssistant';

const QUICK_PROMPTS = [
  'Help me plan today using my existing tasks.',
  'Adjust my schedule so everything fits before 6 PM.',
  'Suggest focus blocks for deep work this afternoon.'
];

const buildSystemMessage = (tasks: Task[]): AssistantMessage => {
  const sorted = [...tasks].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const snapshot = sorted
    .slice(0, 20)
    .map((task) => {
      const scheduled = dayjs(task.scheduledTime);
      const end = task.endTime
        ? dayjs(task.endTime)
        : scheduled.add(1, 'hour');
      const range = `${scheduled.format('MMM D, h:mm A')} – ${end.format('h:mm A')}`;
      const details = [task.title, task.notes?.trim()].filter(Boolean).join(' — ');
      const status = task.status === 'scheduled' ? 'synced' : 'pending';
      return `- ${range}: ${details || task.title} (${status})`;
    })
    .join('\n');

  return {
    role: 'system',
    content: `You are FocusPlan's scheduling assistant. Help the user plan realistic focus blocks, adjust timings, and surface conflicts.
Always propose specific start times and short rationales. Keep replies under 180 words.
If the user references "my tasks", consider this snapshot:\n${snapshot || '- No tasks are currently scheduled.'}`
  };
};

export const SchedulerAssistant = () => {
  const { tasks } = useTasks();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can help fine-tune your focus schedule or suggest smart blocks. Tell me what you need.'
    }
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const systemMessage = useMemo(() => buildSystemMessage(tasks), [tasks]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = async (prompt?: string) => {
    const input = (prompt ?? draft).trim();
    if (!input || sending) {
      return;
    }

    const userMessage: AssistantMessage = { role: 'user', content: input };
    const history = [...messages, userMessage].slice(-10);
    setMessages(history);
    setDraft('');
    setSending(true);
    setError(null);

    try {
      const response = await invokeSchedulerAssistant([systemMessage, ...history]);
      const assistantReply: AssistantMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.warn('Assistant request failed', err);
      const message = err instanceof Error ? err.message : 'Unknown error invoking assistant.';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const disabled = sending || !draft.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
      style={styles.wrapper}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Smart scheduling assistant</Text>
        <Text style={styles.subheading}>
          Ask for help rescheduling tasks or drafting a balanced focus plan.
        </Text>
        <View style={styles.quickPromptRow}>
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              style={[styles.quickPrompt, sending ? styles.quickPromptDisabled : null]}
              onPress={() => send(prompt)}
              disabled={sending}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView
          ref={(node) => {
            scrollRef.current = node;
          }}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContainer}
        >
          {messages.map((message, index) => (
            <View
              key={`${message.role}-${index}`}
              style={[
                styles.message,
                message.role === 'assistant' ? styles.messageAssistant : styles.messageUser
              ]}
            >
              <Text style={styles.messageAuthor}>
                {message.role === 'assistant' ? 'Assistant' : 'You'}
              </Text>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))}
          {sending ? (
            <View style={[styles.message, styles.messageAssistant]}>
              <ActivityIndicator color="#c4b5fd" size="small" />
            </View>
          ) : null}
        </ScrollView>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask the assistant to shape your schedule…"
            placeholderTextColor="rgba(226,232,240,0.6)"
            multiline
            value={draft}
            onChangeText={setDraft}
            editable={!sending}
          />
          <Pressable
            style={[styles.sendButton, disabled ? styles.sendButtonDisabled : null]}
            onPress={() => send()}
            disabled={disabled}
          >
            <Text style={styles.sendButtonText}>{sending ? 'Sending…' : 'Send'}</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          Your API key is used directly from the device. Avoid sharing this build if the key is
          sensitive.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    gap: 12
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0'
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(226,232,240,0.75)'
  },
  quickPromptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickPrompt: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(99,102,241,0.15)'
  },
  quickPromptDisabled: {
    opacity: 0.5
  },
  quickPromptText: {
    fontSize: 12,
    color: '#c7d2fe'
  },
  messageScroll: {
    maxHeight: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(30,41,59,0.4)'
  },
  messageContainer: {
    padding: 12,
    gap: 8
  },
  message: {
    padding: 10,
    borderRadius: 10,
    gap: 4
  },
  messageAssistant: {
    backgroundColor: 'rgba(99,102,241,0.18)',
    alignSelf: 'flex-start'
  },
  messageUser: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    alignSelf: 'flex-end'
  },
  messageAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(226,232,240,0.7)'
  },
  messageText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    backgroundColor: 'rgba(15,23,42,0.6)'
  },
  sendButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6366f1'
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(99,102,241,0.35)'
  },
  sendButtonText: {
    fontWeight: '600',
    color: '#f8fafc'
  },
  error: {
    color: '#fca5a5',
    fontSize: 12
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(226,232,240,0.5)'
  }
});
