import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

/** Liveops API for rotating Rift modifiers and viewing active matches. */
export function createLiveopsService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/admin/rift-modifier', async (req, res) => {
    const body = z.object({ modifier: z.string(), intensity: z.number().min(0).max(5) }).safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.flatten() });
    }
    let affected = 0;
    for (const match of store.matches.values()) {
      if (!match.endedAt) {
        match.riftState = { ...match.riftState, modifier: body.data.modifier, intensity: body.data.intensity };
        affected += 1;
        if (db) {
          await db.upsertMatch(match);
        }
      }
    }
    await logEventWithPersistence(db, { playerId: null, name: 'admin_modifier_override', payload: body.data });
    return res.json({ ok: true, affected_matches: affected });
  });

  app.get('/admin/active-matches', (_req, res) => {
    return res.json(Array.from(store.matches.values()).filter((m) => !m.endedAt));
  });

  app.get('/analytics/summary', (_req, res) => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const events = store.analyticsEvents;
    const dau = new Set(events.filter((e) => e.playerId && Date.parse(e.createdAt) >= dayAgo).map((e) => e.playerId)).size;
    const mau = new Set(events.filter((e) => e.playerId && Date.parse(e.createdAt) >= monthAgo).map((e) => e.playerId)).size;

    const completed = Array.from(store.matches.values()).filter((m) => m.endedAt);
    const avgMatchDurationSeconds = (() => {
      if (completed.length === 0) return 0;
      const total = completed.reduce((acc, m) => acc + (Date.parse(m.endedAt!) - Date.parse(m.startedAt)) / 1000, 0);
      return Math.round(total / completed.length);
    })();

    return res.json({
      dau,
      mau,
      events: events.length,
      completedMatches: completed.length,
      avgMatchDurationSeconds
    });
  });

  app.get('/analytics/cohorts', (_req, res) => {
    const now = Date.now();
    const cohorts = [1, 7, 28].map((days) => {
      const threshold = now - days * 24 * 60 * 60 * 1000;
      const activeIds = new Set(
        store.analyticsEvents
          .filter((e) => e.playerId && Date.parse(e.createdAt) >= threshold)
          .map((e) => e.playerId as string)
      );
      return { day: days, activePlayers: activeIds.size };
    });
    res.json({ cohorts });
  });

  return app;
}
