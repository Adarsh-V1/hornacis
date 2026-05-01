function getRequiredEnv(name: 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY' | 'EXPO_PUBLIC_CONVEX_URL') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in your environment configuration.`);
  }

  return value;
}

export const env = {
  clerkPublishableKey: getRequiredEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  convexUrl: getRequiredEnv('EXPO_PUBLIC_CONVEX_URL'),
} as const;
