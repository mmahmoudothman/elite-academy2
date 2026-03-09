import { useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analyticsTracker';

export function useAnalyticsTracker() {
  const { user } = useAuth();

  const track = useCallback((
    eventType: Parameters<typeof trackEvent>[0],
    options?: Parameters<typeof trackEvent>[1]
  ) => {
    trackEvent(eventType, { ...options, userId: options?.userId || user?.id });
  }, [user?.id]);

  return { track };
}

// Hook to track page views automatically
export function usePageView(pageName: string) {
  const { track } = useAnalyticsTracker();
  useEffect(() => {
    track('page_view', { metadata: { page: pageName } });
  }, [pageName]); // eslint-disable-line
}
