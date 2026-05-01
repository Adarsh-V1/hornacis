import { ConvexReactClient } from 'convex/react';
import { makeFunctionReference, type UserIdentity } from 'convex/server';

import { env } from '@/config/env';

export const convex = new ConvexReactClient(env.convexUrl);

export const currentUserIdentityQuery = makeFunctionReference<
  'query',
  Record<string, never>,
  UserIdentity
>('auth:currentUserIdentity');
