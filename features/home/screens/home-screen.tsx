import { useClerk, useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { darkTheme, Fonts, lightTheme } from '@/constants/theme';
import { currentUserIdentityQuery } from '@/lib/convex';
import { ROUTES } from '@/lib/routes';

export function HomeScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const identity = useQuery(currentUserIdentityQuery);

  const emailAddress =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? 'Unknown';

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace(ROUTES.auth.signIn);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(108,99,255,0.12)',
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ThemedText
            type="title"
            style={[styles.heroTitle, { color: palette.text }]}>
            Hornacis
          </ThemedText>
          <ThemedText style={[styles.heroCopy, { color: palette.textSecondary }]}>
            Clerk is connected, Convex is authenticated, and this screen is protected.
          </ThemedText>
        </View>

        <Card palette={palette} isDark={isDark}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: palette.text }]}>
            Signed-in user
          </ThemedText>
          <ThemedText style={{ color: palette.textSecondary }}>{emailAddress}</ThemedText>
        </Card>

        <Card palette={palette} isDark={isDark}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: palette.text }]}>
            Convex identity
          </ThemedText>
          {identity === undefined ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={palette.primary} />
              <ThemedText style={{ color: palette.textSecondary }}>
                Loading authenticated identity...
              </ThemedText>
            </View>
          ) : (
            <ThemedText
              style={[
                styles.identityBlock,
                { color: palette.textSecondary, fontFamily: Fonts.mono },
              ]}>
              {JSON.stringify(identity, null, 2)}
            </ThemedText>
          )}
        </Card>

        <Pressable
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
          style={({ pressed }) => [
            styles.signOutWrap,
            isSigningOut && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}>
          <LinearGradient
            colors={[lightTheme.primary, lightTheme.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signOutButton}>
            <ThemedText
              style={styles.signOutText}
              lightColor={lightTheme.onPrimary}
              darkColor={lightTheme.onPrimary}>
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Card({
  palette,
  isDark,
  children,
}: {
  palette: typeof lightTheme | typeof darkTheme;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(18,24,38,0.6)' : 'rgba(255,255,255,0.7)',
          borderColor: palette.border,
        },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    top: -160,
    right: -120,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  hero: {
    gap: 8,
    paddingTop: 12,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    gap: 10,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identityBlock: {
    fontSize: 12,
    lineHeight: 18,
  },
  signOutWrap: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  signOutButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
