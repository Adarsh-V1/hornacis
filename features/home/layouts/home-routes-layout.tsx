import { Redirect, Stack } from 'expo-router';
import { useConvexAuth } from 'convex/react';

import { FullScreenStatus } from '@/components/full-screen-status';
import { ROUTES } from '@/lib/routes';

export function HomeRoutesLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <FullScreenStatus message="Connecting to Convex..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.signIn} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
