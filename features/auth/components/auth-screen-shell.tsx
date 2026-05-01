import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreenShell({ title, subtitle, children }: AuthScreenShellProps) {
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const gradientColors = isDark
    ? (['#0B0F19', '#121826', '#0B0F19'] as const)
    : (['#F5F7FA', '#EEF1F8', '#F5F7FA'] as const);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowTop,
          { backgroundColor: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(108,99,255,0.14)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowBottom,
          { backgroundColor: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(0,194,255,0.10)' },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <BlurView
            intensity={isDark ? 30 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.card, { borderColor: palette.border }]}>
            <View style={styles.cardInner}>
              <ThemedText
                type="title"
                lightColor={lightTheme.text}
                darkColor={darkTheme.text}
                style={styles.title}>
                {title}
              </ThemedText>
              <ThemedText
                style={styles.subtitle}
                lightColor={lightTheme.textSecondary}
                darkColor={darkTheme.textSecondary}>
                {subtitle}
              </ThemedText>
              <View style={styles.body}>{children}</View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardInner: {
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  body: {
    gap: 12,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.9,
  },
  glowTop: {
    top: -120,
    right: -80,
  },
  glowBottom: {
    bottom: -140,
    left: -100,
  },
});
