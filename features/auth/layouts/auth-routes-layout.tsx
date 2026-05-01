import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

import { FullScreenStatus } from '@/components/full-screen-status';
import { ROUTES } from '@/lib/routes';

export function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenStatus message="Loading authentication..." />;
  }

  if (isSignedIn) {
    return <Redirect href={ROUTES.home} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
