import { useAuth, useSignUp } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
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
import { PendingAvatar } from '../lib/pending-avatar';

export function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? darkTheme : lightTheme;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = React.useState<string | null>(null);

  async function pickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error(
          'Permission needed',
          'We need access to your photos to set your profile picture.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        toast.error('Could not load photo', 'Try a different image.');
        return;
      }

      const mime = asset.mimeType ?? 'image/jpeg';
      setAvatarDataUrl(`data:${mime};base64,${asset.base64}`);
      setAvatarPreview(asset.uri);
    } catch (err) {
      toast.error('Could not pick photo', clerkErrorMessage(err));
    }
  }

  async function finalizeSignUp() {
    if (avatarDataUrl) {
      PendingAvatar.set(avatarDataUrl);
    }

    const { error } = await signUp.finalize({
      navigate: ({ session }) => {
        if (session.currentTask) {
          toast.info('Action required', 'Finish the pending Clerk session task to continue.');
          return;
        }

        router.replace(ROUTES.home);
      },
    });

    if (error) {
      toast.error('Sign-up failed', clerkErrorMessage(error));
    }
  }

  async function handleSubmit() {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    const { error } = await signUp.password({
      emailAddress,
      password,
      ...(trimmedFirst && { firstName: trimmedFirst }),
      ...(trimmedLast && { lastName: trimmedLast }),
    });

    if (error) {
      toast.error('Sign-up failed', clerkErrorMessage(error));
      return;
    }

    const verificationResult = await signUp.verifications.sendEmailCode();
    if (verificationResult.error) {
      toast.error('Could not send code', clerkErrorMessage(verificationResult.error));
      return;
    }

    toast.info('Verification sent', 'Check your inbox for the code.');
  }

  async function handleVerify() {
    const { error } = await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      toast.error('Verification failed', clerkErrorMessage(error));
      return;
    }

    if (signUp.status === 'complete') {
      await finalizeSignUp();
      return;
    }

    toast.error('Sign-up incomplete', 'Please try again.');
  }

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  const isWaitingForEmailCode =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

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

          <AvatarPicker
            preview={avatarPreview}
            onPick={() => void pickAvatar()}
            palette={palette}
            isDark={isDark}
          />

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <ThemedText style={[styles.label, { color: palette.text }]}>First name</ThemedText>
              <TextInput
                style={inputStyle}
                value={firstName}
                placeholder="Optional"
                placeholderTextColor={placeholderColor}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            <View style={styles.nameField}>
              <ThemedText style={[styles.label, { color: palette.text }]}>Last name</ThemedText>
              <TextInput
                style={inputStyle}
                value={lastName}
                placeholder="Optional"
                placeholderTextColor={placeholderColor}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

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

function AvatarPicker({
  preview,
  onPick,
  palette,
  isDark,
}: {
  preview: string | null;
  onPick: () => void;
  palette: typeof lightTheme | typeof darkTheme;
  isDark: boolean;
}) {
  return (
    <View style={styles.avatarRow}>
      <Pressable
        onPress={onPick}
        style={({ pressed }) => [
          styles.avatarCircle,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
            borderColor: palette.border,
          },
          pressed && styles.buttonPressed,
        ]}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.avatarImage} />
        ) : (
          <ThemedText style={[styles.avatarPlus, { color: palette.primary }]}>+</ThemedText>
        )}
      </Pressable>
      <View style={styles.avatarLabel}>
        <ThemedText style={[styles.avatarTitle, { color: palette.text }]}>
          Profile photo
        </ThemedText>
        <ThemedText style={{ color: palette.textMuted, fontSize: 12 }}>
          {preview ? 'Tap to change' : 'Optional — tap to add'}
        </ThemedText>
      </View>
    </View>
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlus: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  avatarLabel: {
    flex: 1,
    gap: 2,
  },
  avatarTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
    gap: 6,
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
