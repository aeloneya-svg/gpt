import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';

/**
 * Logs analytics events in-memory and persists them when DB is available.
 */
export async function logEventWithPersistence(
  db: PostgresAdapter | null,
  event: { playerId: string | null; name: string; payload: Record<string, unknown> }
): Promise<void> {
  const saved = store.logEvent(event);
  if (saved && db) {
    await db.insertAnalyticsEvent(saved);
  }
}
