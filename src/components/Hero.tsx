import { StyleSheet, Text, View } from 'react-native';

export const Hero = () => (
  <View style={styles.container}>
    <Text style={styles.badge}>Productivity Planner</Text>
    <Text style={styles.title}>Plan smarter, focus deeper.</Text>
    <Text style={styles.subtitle}>
      Capture upcoming work, schedule intentional focus sessions, and sync everything to Google Calendar in one place.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignSelf: 'flex-start'
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#c7d2fe',
    fontWeight: '600',
    letterSpacing: 0.5
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 40
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(241,245,249,0.85)',
    maxWidth: 560
  }
});
