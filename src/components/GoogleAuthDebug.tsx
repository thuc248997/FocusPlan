import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGoogleAuthContext } from '../context/GoogleAuthProvider';

export const GoogleAuthDebug: React.FC = () => {
  const googleAuth = useGoogleAuthContext();

  if (!__DEV__) {
    return null;
  }

  const checkToken = async () => {
    try {
      const token = await googleAuth.ensureAuthenticated();
      console.log('Token check successful:', {
        hasToken: !!token,
        accessToken: token.accessToken ? `${token.accessToken.substring(0, 20)}...` : 'none',
        expiresIn: token.expiresIn,
        issuedAt: new Date(token.issuedAt).toISOString()
      });
      alert('Token is valid! Check console for details.');
    } catch (error) {
      console.error('Token check failed:', error);
      alert(`Token check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info (Dev Only)</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Auth Status:</Text>
        <Text style={[styles.value, googleAuth.isAuthenticated ? styles.success : styles.error]}>
          {googleAuth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Initializing:</Text>
        <Text style={styles.value}>{googleAuth.initializing ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Config Valid:</Text>
        <Text style={[styles.value, !googleAuth.missingClientConfig ? styles.success : styles.error]}>
          {!googleAuth.missingClientConfig ? 'Yes' : 'No - Missing Client ID'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Has Token:</Text>
        <Text style={styles.value}>{googleAuth.token ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={checkToken}>
          <Text style={styles.buttonText}>Test Token</Text>
        </Pressable>
        <Pressable 
          style={[styles.button, styles.buttonSecondary]} 
          onPress={() => {
            googleAuth.disconnect();
            alert('Disconnected from Google');
          }}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.5)'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffc107',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  label: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  value: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500'
  },
  success: {
    color: '#4caf50'
  },
  error: {
    color: '#f44336'
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  button: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonSecondary: {
    backgroundColor: '#ef4444'
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
