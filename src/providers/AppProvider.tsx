import { useEffect } from 'react';
import { useAuthStore } from '@store/auth.store';
import { QueryProvider } from '@providers/QueryProvider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <QueryProvider>{children}</QueryProvider>;
}
