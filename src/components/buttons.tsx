import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

const wrapAsyncHandler = (handler: ButtonProps['onPress']) => () => {
  try {
    const result = handler();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch((error) =>
        console.warn('Button press failed', error)
      );
    }
  } catch (error) {
    console.warn('Button press threw synchronously', error);
  }
};

export const PrimaryButton = ({ label, onPress, disabled }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    style={[styles.base, styles.primary, disabled && styles.disabled]}
    onPress={wrapAsyncHandler(onPress)}
    disabled={disabled}
  >
    <Text style={[styles.label, styles.primaryLabel]}>{label}</Text>
  </Pressable>
);

export const SecondaryButton = ({ label, onPress, disabled }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    style={[styles.base, styles.secondary, disabled && styles.disabledSecondary]}
    onPress={wrapAsyncHandler(onPress)}
    disabled={disabled}
  >
    <Text style={[styles.label, styles.secondaryLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  primaryLabel: {
    color: '#f8fafc'
  },
  disabled: {
    backgroundColor: '#7c3aed55'
  },
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)'
  },
  disabledSecondary: {
    borderColor: 'rgba(148,163,184,0.2)'
  },
  secondaryLabel: {
    color: '#e2e8f0'
  },
  label: {
    fontWeight: '600',
    fontSize: 16
  }
});
