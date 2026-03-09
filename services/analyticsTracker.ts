import { AnalyticsEvent } from '../types';

const STORAGE_KEY = 'elite_academy_analytics_events';

function generateId(): string {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('elite_session_id');
  if (!sid) {
    sid = 'ses_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    sessionStorage.setItem('elite_session_id', sid);
  }
  return sid;
}

export function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  options?: { entityType?: string; entityId?: string; userId?: string; metadata?: Record<string, any> }
): void {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const event: AnalyticsEvent = {
    id: generateId(),
    eventType,
    entityType: options?.entityType,
    entityId: options?.entityId,
    userId: options?.userId,
    metadata: options?.metadata,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };
  events.push(event);
  // Keep last 10000 events max
  if (events.length > 10000) events.splice(0, events.length - 10000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function getEventsByType(eventType: string): AnalyticsEvent[] {
  return getAnalyticsEvents().filter(e => e.eventType === eventType);
}

export function getEventsByDateRange(start: number, end: number): AnalyticsEvent[] {
  return getAnalyticsEvents().filter(e => e.timestamp >= start && e.timestamp <= end);
}
