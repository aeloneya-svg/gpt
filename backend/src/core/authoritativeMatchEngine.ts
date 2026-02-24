import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from './eventLogger.js';

/**
 * Authoritative match tick loop for vertical-slice simulation.
 * Produces deterministic progress and final results over ~8 minutes by default.
 */
export class AuthoritativeMatchEngine {
  private readonly tickIntervalMs: number;
  private readonly db: PostgresAdapter | null;
  private timer: NodeJS.Timeout | null = null;

  public constructor(db: PostgresAdapter | null, tickIntervalMs = 1000) {
    this.db = db;
    this.tickIntervalMs = tickIntervalMs;
  }

  /** Starts background ticking for active matches. */
  public start(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, this.tickIntervalMs);
  }

  /** Stops background tick loop. */
  public stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }

  private async tick(): Promise<void> {
    for (const match of store.matches.values()) {
      if (match.status !== 'RUNNING' || match.endedAt) {
        continue;
      }
      match.riftState.tick += 1;
      if (match.riftState.tick % 120 === 0) {
        match.riftState.intensity = Math.min(5, match.riftState.intensity + 1);
      }

      const elapsed = Math.floor((Date.now() - Date.parse(match.startedAt)) / 1000);
      if (elapsed >= match.durationSeconds) {
        match.status = 'COMPLETED';
        match.endedAt = new Date().toISOString();
        match.results = match.players.map((playerId, index) => ({
          playerId,
          score: Math.max(0, 1000 - index * 10 + Math.floor(Math.random() * 80)),
          extracted: Math.random() > 0.2
        }));
        await logEventWithPersistence(this.db, {
          playerId: null,
          name: 'match_completed',
          payload: { matchId: match.id, players: match.players.length, durationSeconds: match.durationSeconds }
        });
      }

      if (this.db) {
        await this.db.upsertMatch(match);
      }
    }
  }
}
