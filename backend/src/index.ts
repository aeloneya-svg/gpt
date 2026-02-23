import cors from 'cors';
import express from 'express';
import { createAuthService } from './services/authService.js';
import { createMatchmakingService } from './services/matchmakingService.js';
import { createMatchService } from './services/matchService.js';
import { createBuildsService } from './services/buildsService.js';
import { createLiveopsService } from './services/liveopsService.js';
import { createModerationService } from './services/moderationService.js';
import { createSafetyService } from './services/safetyService.js';
import { createStoreService } from './services/storeService.js';
import { createAntiCheatService } from './services/antiCheatService.js';
import { AuthoritativeMatchEngine } from './core/authoritativeMatchEngine.js';
import { LiveopsScheduler } from './core/liveopsScheduler.js';
import { PostgresAdapter } from './data/postgres.js';

/** Bootstraps all vertical-slice services into one process for local reproducibility. */
async function start(): Promise<void> {
  const app = express();
  app.use(cors());

  const dbUrl = process.env.DATABASE_URL;
  let db: PostgresAdapter | null = null;
  if (dbUrl) {
    const adapter = new PostgresAdapter(dbUrl);
    const ok = await adapter.ping();
    if (ok) {
      db = adapter;
      console.log('Postgres adapter enabled.');
    } else {
      console.log('Postgres unavailable; using in-memory storage.');
    }
  }

  app.use(createAuthService(db));
  app.use(createMatchmakingService(db));
  app.use(createMatchService());
  app.use(createBuildsService(db));
  app.use(createLiveopsService(db));
  app.use(createModerationService(db));
  app.use(createSafetyService(db));
  app.use(createStoreService(db));
  app.use(createAntiCheatService(db));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'echorift-backend', persistence: db ? 'postgres' : 'in-memory' });
  });

  const engine = new AuthoritativeMatchEngine(db, 1000);
  const scheduler = new LiveopsScheduler(db, Number(process.env.RIFT_ROTATION_SECONDS ?? 180));
  engine.start();
  scheduler.start();

  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => {
    console.log(`EchoRift backend running on :${port}`);
  });
}

start();
