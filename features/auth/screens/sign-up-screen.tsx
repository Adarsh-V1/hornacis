import { useAuth, useSignUp } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';
import { ROUTES } from '@/lib/routes';

import { AuthScreenShell } from '../components/auth-screen-shell';
import {
  SOCIAL_PROVIDERS,
  SocialButton,
  SocialDivider,
} from '../components/social-button';

export function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  async function finalizeSignUp() {
    const { error } = await signUp.finalize({
      navigate: ({ session }) => {
        if (session.currentTask) {
          console.log(
            'Complete the pending Clerk session task before continuing.',
            session.currentTask,
          );
          return;
        }

        router.replace(ROUTES.home);
      },
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  }

  async function handleSubmit() {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    const verificationResult = await signUp.verifications.sendEmailCode();
    if (verificationResult.error) {
      console.error(JSON.stringify(verificationResult.error, null, 2));
    }
  }

  async function handleVerify() {
    const { error } = await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signUp.status === 'complete') {
      await finalizeSignUp();
      return;
    }

    console.error('Sign-up attempt not complete:', signUp);
  }

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  const isWaitingForEmailCode =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  const isSubmitting = fetchStatus === 'fetching';
  const globalError = errors.global?.[0]?.message ?? null;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
      borderColor: palette.border,
      color: palette.text,
    },
  ];

  const placeholderColor = palette.textMuted;

  return (
    <AuthScreenShell
      title={isWaitingForEmailCode ? 'Verify email' : 'Create account'}
      subtitle={
        isWaitingForEmailCode
          ? 'Enter the code Clerk sent to your email address.'
          : 'Create a Clerk account, then Convex will trust the same session.'
      }>
      {isWaitingForEmailCode ? (
        <>
          <ThemedText style={[styles.label, { color: palette.text }]}>
            Verification code
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor={placeholderColor}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          {errors.fields.code && (
            <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
          )}

          {globalError && <ThemedText style={styles.error}>{globalError}</ThemedText>}

          <PrimaryButton
            disabled={!code || isSubmitting}
            label="Verify and continue"
            onPress={() => void handleVerify()}
          />

          <Pressable
            onPress={() => void signUp.verifications.sendEmailCode()}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border },
              pressed && styles.buttonPressed,
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: palette.primary }]}>
              Send a new code
            </ThemedText>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.socialStack}>
            {SOCIAL_PROVIDERS.map((provider) => (
              <SocialButton
                key={provider}
                provider={provider}
                onSuccess={() => router.replace(ROUTES.home)}
              />
            ))}
          </View>

          <SocialDivider label="or sign up with email" />

          <ThemedText style={[styles.label, { color: palette.text }]}>Email address</ThemedText>
          <TextInput
            style={inputStyle}
            value={emailAddress}
            placeholder="you@example.com"
            placeholderTextColor={placeholderColor}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.fields.emailAddress && (
            <ThemedText style={styles.error}>{errors.fields.emailAddress.message}</ThemedText>
          )}

          <ThemedText style={[styles.label, { color: palette.text }]}>Password</ThemedText>
          <TextInput
            style={inputStyle}
            value={password}
            placeholder="Create a password"
            placeholderTextColor={placeholderColor}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.fields.password && (
            <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
          )}

          {globalError && <ThemedText style={styles.error}>{globalError}</ThemedText>}

          <PrimaryButton
            disabled={!emailAddress || !password || isSubmitting}
            label="Create account"
            onPress={() => void handleSubmit()}
          />
        </>
      )}

      <View style={styles.linkRow}>
        <ThemedText style={{ color: palette.textSecondary }}>Already have an account?</ThemedText>
        <Link href={ROUTES.auth.signIn}>
          <ThemedText style={[styles.linkText, { color: palette.primary }]}>Sign in</ThemedText>
        </Link>
      </View>
    </AuthScreenShell>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryWrap,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}>
      <LinearGradient
        colors={[lightTheme.primary, lightTheme.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryGradient}>
        <ThemedText
          style={styles.primaryButtonText}
          lightColor={lightTheme.onPrimary}
          darkColor={lightTheme.onPrimary}>
          {label}
        </ThemedText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  socialStack: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryWrap: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    justifyContent: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
});
