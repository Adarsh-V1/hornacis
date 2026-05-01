import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info';

type ToastInput = {
  type?: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
};

type Toast = Required<Omit<ToastInput, 'description' | 'durationMs'>> & {
  id: string;
  description?: string;
  durationMs: number;
};

type ToastApi = {
  show: (toast: ToastInput) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 3600;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = React.useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: Toast = {
        id,
        type: input.type ?? 'info',
        title: input.title,
        description: input.description,
        durationMs: input.durationMs ?? DEFAULT_DURATION,
      };
      setToasts((current) => [...current, toast]);

      const timer = setTimeout(() => dismiss(id), toast.durationMs);
      timers.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  const api = React.useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ type: 'success', title, description }),
      error: (title, description) => show({ type: 'error', title, description }),
      info: (title, description) => show({ type: 'info', title, description }),
      dismiss,
    }),
    [show, dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.viewport, { top: insets.top + 8 }]}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const translateY = React.useRef(new Animated.Value(-30)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const accent = TOAST_ACCENT[toast.type];

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { transform: [{ translateY }], opacity },
      ]}>
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.card, { borderColor: palette.border }]}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: accent }]} />
              <ThemedText
                style={styles.title}
                numberOfLines={2}
                lightColor={lightTheme.text}
                darkColor={darkTheme.text}>
                {toast.title}
              </ThemedText>
            </View>
            {toast.description ? (
              <ThemedText
                style={styles.description}
                numberOfLines={3}
                lightColor={lightTheme.textSecondary}
                darkColor={darkTheme.textSecondary}>
                {toast.description}
              </ThemedText>
            ) : null}
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const TOAST_ACCENT: Record<ToastType, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: lightTheme.primary,
};

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 8,
  },
  cardWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  pressable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 16,
  },
});
