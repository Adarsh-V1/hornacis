import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

type FullScreenStatusProps = {
  message: string;
};

export function FullScreenStatus({ message }: FullScreenStatusProps) {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="small" color={Colors.light.tint} />
      <ThemedText>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
