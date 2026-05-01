import { useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { lightTheme } from '@/constants/theme';
import { ROUTES } from '@/lib/routes';

WebBrowser.maybeCompleteAuthSession();

type SocialProvider = 'google' | 'apple';

type SocialButtonProps = {
  provider: SocialProvider;
  onSuccess: () => void;
};

const PROVIDER_CONFIG: Record<SocialProvider, { label: string; strategy: 'oauth_google' | 'oauth_apple' }> = {
  google: { label: 'Continue with Google', strategy: 'oauth_google' },
  apple: { label: 'Continue with Apple', strategy: 'oauth_apple' },
};

export function SocialButton({ provider, onSuccess }: SocialButtonProps) {
  const { startSSOFlow } = useSSO();
  const [isPending, setIsPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const config = PROVIDER_CONFIG[provider];

  async function handlePress() {
    try {
      setErrorMessage(null);
      setIsPending(true);

      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'hornacis',
        path: 'sso-callback',
      });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: config.strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onSuccess();
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in was cancelled or failed.';
      setErrorMessage(message);
      console.error(`[SocialButton:${provider}]`, err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={isPending}
        onPress={() => void handlePress()}
        style={({ pressed }) => [
          styles.button,
          provider === 'apple' && styles.appleButton,
          isPending && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}>
        {isPending ? (
          <ActivityIndicator size="small" color={provider === 'apple' ? '#fff' : lightTheme.text} />
        ) : (
          <>
            <ProviderGlyph provider={provider} />
            <ThemedText
              style={[styles.label, provider === 'apple' && styles.appleLabel]}>
              {config.label}
            </ThemedText>
          </>
        )}
      </Pressable>
      {errorMessage && <ThemedText style={styles.error}>{errorMessage}</ThemedText>}
    </View>
  );
}

function ProviderGlyph({ provider }: { provider: SocialProvider }) {
  if (provider === 'google') {
    return (
      <ThemedText style={styles.googleGlyph} lightColor="#0F172A" darkColor="#0F172A">
        G
      </ThemedText>
    );
  }
  return (
    <ThemedText style={styles.appleGlyph} lightColor="#FFFFFF" darkColor="#FFFFFF">
      {Platform.OS === 'ios' ? '' : ''}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  appleButton: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: lightTheme.text,
  },
  appleLabel: {
    color: '#FFFFFF',
  },
  googleGlyph: {
    fontSize: 17,
    fontWeight: '800',
    width: 18,
    textAlign: 'center',
  },
  appleGlyph: {
    fontSize: 17,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: -2,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
  },
});

export const SOCIAL_PROVIDERS: SocialProvider[] = Platform.OS === 'ios' ? ['google', 'apple'] : ['google'];

export type { SocialProvider };
export { PROVIDER_CONFIG };

export function SocialDivider({ label = 'or continue with email' }: { label?: string }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.line} />
      <ThemedText style={dividerStyles.label} lightColor={lightTheme.textMuted} darkColor="#9CA3AF">
        {label}
      </ThemedText>
      <View style={dividerStyles.line} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightTheme.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
