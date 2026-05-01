import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#EEF1F8', dark: '#121826' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#6C63FF"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app is now wired up with Clerk and Convex.</ThemedText>
      <Collapsible title="Feature-based structure">
        <ThemedText>
          Route files now stay in <ThemedText type="defaultSemiBold">app/</ThemedText>, while
          the auth and home logic lives in{' '}
          <ThemedText type="defaultSemiBold">features/</ThemedText>.
        </ThemedText>
        <ThemedText>
          Shared setup is split across{' '}
          <ThemedText type="defaultSemiBold">config/</ThemedText>,{' '}
          <ThemedText type="defaultSemiBold">lib/</ThemedText>, and{' '}
          <ThemedText type="defaultSemiBold">providers/</ThemedText>.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Protected routing">
        <ThemedText>
          Public auth routes live in <ThemedText type="defaultSemiBold">app/(auth)</ThemedText>.
        </ThemedText>
        <ThemedText>
          Protected screens live under{' '}
          <ThemedText type="defaultSemiBold">app/(home)/(tabs)</ThemedText>.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/advanced/protected/">
          <ThemedText type="link">Expo Router protected routes</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Convex auth">
        <ThemedText>
          The test query is in <ThemedText type="defaultSemiBold">convex/auth.ts</ThemedText> and
          it calls <ThemedText type="defaultSemiBold">ctx.auth.getUserIdentity()</ThemedText>.
        </ThemedText>
        <ThemedText>
          Clerk issuer configuration lives in{' '}
          <ThemedText type="defaultSemiBold">convex/auth.config.ts</ThemedText>.
        </ThemedText>
        <ExternalLink href="https://docs.convex.dev/auth/clerk">
          <ThemedText type="link">Convex + Clerk guide</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Starter assets">
        <ThemedText>
          The original Expo starter assets are still here if you want to keep building on them.
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
      </Collapsible>
      <Collapsible title="Platform support">
        <ThemedText>
          Email and password auth works in Expo Go, iOS, Android, and web with this setup.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              Native Clerk UI components are also available later if you move to a dev build.
            </ThemedText>
          ),
          default: (
            <ThemedText>
              You can add OAuth or native Clerk components later if you want a richer auth flow.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
