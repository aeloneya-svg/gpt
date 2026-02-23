import crypto from 'node:crypto';
import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

/** Creator hub publishing endpoint with moderation hooks. */
export function createBuildsService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.post('/builds/publish', async (req, res) => {
    const body = z
      .object({
        author_id: z.string(),
        title: z.string().min(3),
        asset_blob: z.string().min(5),
        tags: z.array(z.string()).max(10)
      })
      .safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.flatten() });
    }

    const id = crypto.randomUUID();
    const build = {
      id,
      authorId: body.data.author_id,
      assetBlob: body.data.asset_blob,
      title: body.data.title,
      tags: body.data.tags,
      rating: 0,
      visits: 0,
      createdAt: new Date().toISOString()
    };
    store.builds.set(id, build);
    if (db) {
      await db.insertBuild(build);
    }
    await logEventWithPersistence(db, {
      playerId: body.data.author_id,
      name: 'build_publish',
      payload: { buildId: id, tags: body.data.tags }
    });

    return res.status(201).json({ id, moderation_status: 'PENDING_AUTOMATED_SCAN' });
  });

  app.get('/builds/trending', (_req, res) => {
    const builds = Array.from(store.builds.values())
      .sort((a, b) => b.rating * 2 + b.visits - (a.rating * 2 + a.visits))
      .slice(0, 20);
    return res.json(builds);
  });

  return app;
}
