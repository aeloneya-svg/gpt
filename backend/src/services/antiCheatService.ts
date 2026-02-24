import crypto from 'node:crypto';
import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import { logEventWithPersistence } from '../core/eventLogger.js';
import type { PostgresAdapter } from '../data/postgres.js';

/** Anti-cheat evidence hooks for authoritative review pipelines. */
export function createAntiCheatService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/anti-cheat/flag', async (req, res) => {
    const parsed = z
      .object({
        match_id: z.string(),
        player_id: z.string(),
        reason: z.enum(['AIM_ASSIST', 'SPEED_HACK', 'TELEPORT', 'OTHER']),
        confidence: z.number().min(0).max(1)
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const flag = {
      id: crypto.randomUUID(),
      matchId: parsed.data.match_id,
      playerId: parsed.data.player_id,
      reason: parsed.data.reason,
      confidence: parsed.data.confidence,
      createdAt: new Date().toISOString()
    };
    store.antiCheatFlags.set(flag.id, flag);

    await logEventWithPersistence(db, {
      playerId: parsed.data.player_id,
      name: 'anti_cheat_flag',
      payload: { reason: parsed.data.reason, confidence: parsed.data.confidence, matchId: parsed.data.match_id }
    });

    return res.status(201).json(flag);
  });

  app.get('/admin/anti-cheat/flags', (_req, res) => {
    return res.json(Array.from(store.antiCheatFlags.values()));
  });

  return app;
}
