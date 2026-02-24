import express from 'express';
import { z } from 'zod';
import { Matchmaker } from '../core/matchmaker.js';
import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { ServerAllocator } from '../core/serverAllocator.js';
import { logEventWithPersistence } from '../core/eventLogger.js';

const matchmaker = new Matchmaker({
  minPlayers: 30,
  maxPlayers: 30,
  baseSkillDelta: 120,
  deltaIncreaseEverySeconds: 3,
  deltaIncreaseAmount: 40
});
const allocator = new ServerAllocator();

/** Matchmaking queue + server allocation flow. */
export function createMatchmakingService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/matchmaking/join', async (req, res) => {
    const parsed = z
      .object({
        player_id: z.string(),
        party_id: z.string(),
        skill_rating: z.number().int(),
        preferred_modes: z.array(z.string()).default(['RIFT_SKIRMISH']),
        region: z.string().default('us-east'),
        crossplay: z.boolean().default(true)
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    store.queue.push({
      playerId: parsed.data.player_id,
      partyId: parsed.data.party_id,
      skillRating: parsed.data.skill_rating,
      preferredModes: parsed.data.preferred_modes,
      region: parsed.data.region,
      crossplay: parsed.data.crossplay,
      queuedAt: Date.now()
    });

    const matches = matchmaker.proposeMatches(store.queue);
    for (const proposal of matches) {
      const allocation = await allocator.allocate(proposal.matchId, proposal.region);
      const match = {
        id: proposal.matchId,
        mapSeed: Math.floor(Math.random() * 1_000_000),
        players: proposal.players.map((p) => p.playerId),
        riftState: { modifier: 'LOW_GRAVITY', intensity: 1, tick: 0 },
        startedAt: new Date().toISOString(),
        endedAt: null,
        results: [],
        mode: 'RIFT_SKIRMISH' as const,
        region: proposal.region,
        status: 'RUNNING' as const,
        durationSeconds: Number(process.env.MATCH_DURATION_SECONDS ?? 480)
      };
      store.matches.set(proposal.matchId, match);
      if (db) {
        await db.upsertMatch(match);
      }
      await logEventWithPersistence(db, {
        playerId: null,
        name: 'match_created',
        payload: {
          matchId: match.id,
          playerCount: match.players.length,
          serverEndpoint: allocation.endpoint,
          allocationMode: allocation.allocationMode
        }
      });
    }

    return res.json({ status: 'QUEUED', queue_size: store.queue.length, matches_created: matches.length });
  });

  return app;
}
