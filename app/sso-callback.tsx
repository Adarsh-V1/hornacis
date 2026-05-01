import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

import { FullScreenStatus } from '@/components/full-screen-status';
import { ROUTES } from '@/lib/routes';

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenStatus message="Finalising sign-in..." />;
  }

  return <Redirect href={isSignedIn ? ROUTES.home : ROUTES.auth.signIn} />;
}
