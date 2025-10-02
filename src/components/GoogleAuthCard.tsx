import { StyleSheet, Text, View } from 'react-native';
import { useGoogleAuthContext } from '../context/GoogleAuthProvider';
import { PrimaryButton, SecondaryButton } from './buttons';

export const GoogleAuthCard = () => {
  const { isAuthenticated, connect, disconnect, initializing } = useGoogleAuthContext();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Google Calendar</Text>
      <Text style={styles.subtitle}>
        FocusPlan can create events on your Google Calendar when you sync tasks.
      </Text>
      <View style={styles.actions}>
        {isAuthenticated ? (
          <>
            <Text style={styles.connected}>Connected</Text>
            <SecondaryButton label="Disconnect" onPress={disconnect} />
          </>
        ) : (
          <PrimaryButton
            label={initializing ? 'Checking…' : 'Connect Google Calendar'}
            onPress={connect}
            disabled={initializing}
          />
        )}
      </View>
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
  }
});
