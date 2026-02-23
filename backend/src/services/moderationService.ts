import crypto from 'node:crypto';
import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

/** Safety and moderation endpoints for user-generated systems. */
export function createModerationService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/reports', async (req, res) => {
    const body = z
      .object({
        reporter_id: z.string(),
        target_type: z.enum(['BUILD', 'PLAYER']),
        target_id: z.string(),
        reason: z.enum(['ABUSE', 'HATE', 'SELF_HARM', 'CHEAT', 'OTHER']),
        notes: z.string().max(500).default('')
      })
      .safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.flatten() });
    }

    const report = {
      id: crypto.randomUUID(),
      reporterId: body.data.reporter_id,
      targetType: body.data.target_type,
      targetId: body.data.target_id,
      reason: body.data.reason,
      notes: body.data.notes,
      createdAt: new Date().toISOString()
    };
    store.reports.set(report.id, report);
    if (db) {
      await db.insertReport(report);
    }
    await logEventWithPersistence(db, {
      playerId: body.data.reporter_id,
      name: 'report_submitted',
      payload: { targetType: body.data.target_type, reason: body.data.reason }
    });
    return res.status(201).json(report);
  });

  app.get('/admin/reports', (_req, res) => {
    return res.json(Array.from(store.reports.values()));
  });

  return app;
}
