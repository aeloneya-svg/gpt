import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'echorift-dev-secret';

/** Auth service exposes POST /auth/login for lightweight vertical-slice identity. */
export function createAuthService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/auth/login', async (req, res) => {
    const body = z.object({ username: z.string().min(3), isMinor: z.boolean().default(false) }).safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error.flatten() });
    }
    const player = store.seedPlayer(body.data.username, body.data.isMinor);
    if (db) {
      await db.upsertPlayer(player);
    }
    await logEventWithPersistence(db, {
      playerId: player.id,
      name: 'login',
      payload: { isMinor: player.settings.isMinor }
    });
    const token = jwt.sign({ sub: player.id, isMinor: player.settings.isMinor }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, player });
  });

  return app;
}
