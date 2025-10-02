import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskProvider } from './src/context/TaskProvider';
import { TaskForm } from './src/components/TaskForm';
import { TaskList } from './src/components/TaskList';
import { GoogleAuthCard } from './src/components/GoogleAuthCard';
import { GoogleAuthProvider } from './src/context/GoogleAuthProvider';
import { Hero } from './src/components/Hero';

export default function App() {
  const { width } = useWindowDimensions();
  const layoutStyles = useMemo(
    () => ({
      grid: [styles.grid, width >= 960 && styles.gridWide],
      columnWide: [styles.columnWide, width >= 960 && styles.columnWideLarge],
      columnNarrow: [styles.columnNarrow, width >= 960 && styles.columnNarrowLarge]
    }),
    [width]
  );

  return (
    <GoogleAuthProvider>
      <TaskProvider>
        <SafeAreaProvider>
          <LinearGradient colors={['#0b1120', '#1e1b4b']} style={styles.background}>
            <SafeAreaView style={styles.safe}>
              <StatusBar style="light" />
              <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.content}>
                  <Hero />
                  <View style={layoutStyles.grid}>
                    <View style={layoutStyles.columnWide}>
                      <GoogleAuthCard />
                      <TaskForm />
                    </View>
                    <View style={layoutStyles.columnNarrow}>
                      <Text style={styles.sectionTitle}>Your focused sessions</Text>
                      <TaskList />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </SafeAreaProvider>
      </TaskProvider>
    </GoogleAuthProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48
  },
  content: {
    flex: 1,
    gap: 32,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 32,
    paddingBottom: 48
  },
  grid: {
    flexDirection: 'column',
    gap: 24
  },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  columnWide: {
    gap: 16
  },
  columnWideLarge: {
    flex: 3
  },
  columnNarrow: {
    gap: 12
  },
  columnNarrowLarge: {
    flex: 2
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0'
  }
});
