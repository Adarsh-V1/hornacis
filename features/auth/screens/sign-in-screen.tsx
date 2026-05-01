import { useSignIn } from '@clerk/expo';
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
import { useToast } from '@/components/toast';
import { darkTheme, lightTheme } from '@/constants/theme';
import { ROUTES } from '@/lib/routes';

import { AuthScreenShell } from '../components/auth-screen-shell';
import {
  SOCIAL_PROVIDERS,
  SocialButton,
  SocialDivider,
} from '../components/social-button';
import { clerkErrorMessage } from '../lib/clerk-error';

export function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const toast = useToast();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  async function finalizeSignIn() {
    const { error } = await signIn.finalize({
      navigate: ({ session }) => {
        if (session.currentTask) {
          toast.info('Action required', 'Finish the pending Clerk session task to continue.');
          return;
        }

        router.replace(ROUTES.home);
      },
    });

    if (error) {
      toast.error('Sign-in failed', clerkErrorMessage(error));
    }
  }

  async function handleSubmit() {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      toast.error('Sign-in failed', clerkErrorMessage(error));
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeSignIn();
      return;
    }

    if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (emailCodeFactor) {
        const codeResult = await signIn.mfa.sendEmailCode();
        if (codeResult.error) {
          toast.error('Could not send code', clerkErrorMessage(codeResult.error));
        } else {
          toast.info('Verification sent', 'Check your inbox for the code.');
        }
      }
      return;
    }

    if (signIn.status === 'needs_second_factor') {
      toast.info(
        'Second factor required',
        'Configure an email code factor in Clerk to finish this flow.',
      );
      return;
    }

    toast.error('Sign-in incomplete', 'Please try again.');
  }

  async function handleVerify() {
    const { error } = await signIn.mfa.verifyEmailCode({ code });

    if (error) {
      toast.error('Verification failed', clerkErrorMessage(error));
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeSignIn();
      return;
    }

    toast.error('Sign-in incomplete', 'Please try again.');
  }

  const isSubmitting = fetchStatus === 'fetching';

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
      title="Sign in"
      subtitle="Continue into Hornacis with your Clerk account.">
      {signIn.status === 'needs_client_trust' ? (
        <>
          <ThemedText style={[styles.label, { color: palette.text }]}>
            Verification code
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={code}
            placeholder="Enter the code from your email"
            placeholderTextColor={placeholderColor}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          {errors.fields.code && (
            <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
          )}

          <PrimaryButton
            disabled={!code || isSubmitting}
            label="Verify code"
            onPress={() => void handleVerify()}
          />

          <Pressable
            onPress={() => void signIn.mfa.sendEmailCode()}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border },
              pressed && styles.buttonPressed,
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: palette.primary }]}>
              Send a new code
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => void signIn.reset()}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border },
              pressed && styles.buttonPressed,
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: palette.primary }]}>
              Start over
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

          <SocialDivider />

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
          {errors.fields.identifier && (
            <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
          )}

          <ThemedText style={[styles.label, { color: palette.text }]}>Password</ThemedText>
          <TextInput
            style={inputStyle}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor={placeholderColor}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.fields.password && (
            <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
          )}

          <PrimaryButton
            disabled={!emailAddress || !password || isSubmitting}
            label="Continue"
            onPress={() => void handleSubmit()}
          />
        </>
      )}

      <View style={styles.linkRow}>
        <ThemedText style={{ color: palette.textSecondary }}>Need an account?</ThemedText>
        <Link href={ROUTES.auth.signUp}>
          <ThemedText style={[styles.linkText, { color: palette.primary }]}>Create one</ThemedText>
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
