import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

/** Safety and wellbeing controls for parental settings and session limits. */
export function createSafetyService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.get('/players/:id/settings', (req, res) => {
    const player = store.players.get(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json(player.settings);
  });

  app.post('/players/:id/settings', async (req, res) => {
    const parsed = z
      .object({
        parentalControls: z.boolean().optional(),
        dailyLimitMinutes: z.number().int().min(30).max(600).optional(),
        spendCapCents: z.number().int().min(0).max(50000).optional(),
        sessionReminderMinutes: z.number().int().min(15).max(180).optional(),
        analyticsOptIn: z.boolean().optional()
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const player = store.players.get(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.settings = { ...player.settings, ...parsed.data };
    if (player.settings.isMinor) {
      player.settings.parentalControls = true;
      player.settings.spendCapCents = Math.min(player.settings.spendCapCents, 2000);
    }

    if (db) {
      await db.upsertPlayer(player);
    }

    await logEventWithPersistence(db, {
      playerId: player.id,
      name: 'settings_updated',
      payload: parsed.data as Record<string, unknown>
    });

    return res.json(player.settings);
  });

  return app;
}
