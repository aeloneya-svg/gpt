import express from 'express';
import { store } from '../data/store.js';

/** Match state endpoint read by clients/admin panel. */
export function createMatchService(): express.Express {
  const app = express();

  app.get('/match/:id/state', (req, res) => {
    const match = store.matches.get(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    return res.json(match);
  });

  app.get('/matches', (_req, res) => {
    return res.json(Array.from(store.matches.values()));
  });

  return app;
}
