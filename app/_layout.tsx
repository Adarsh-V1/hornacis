import 'react-native-reanimated';

import { RootStack } from '@/navigation/root-stack';
import { AppProviders } from '@/providers/app-providers';

export const unstable_settings = {
  anchor: '(home)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}
