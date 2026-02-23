import { store } from '../data/store.js';
import type { PostgresAdapter } from '../data/postgres.js';
import { logEventWithPersistence } from './eventLogger.js';

const RIFT_ROTATION = ['LOW_GRAVITY', 'SPEED_SURGE', 'INVERTED_GRAVITY', 'ABILITY_OVERCHARGE'];

/**
 * Minimal liveops scheduler that rotates Rift modifiers every cycle.
 */
export class LiveopsScheduler {
  private readonly rotationSeconds: number;
  private readonly db: PostgresAdapter | null;
  private timer: NodeJS.Timeout | null = null;
  private index = 0;

  public constructor(db: PostgresAdapter | null, rotationSeconds = 180) {
    this.db = db;
    this.rotationSeconds = rotationSeconds;
  }

  public start(): void {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      void this.rotate();
    }, this.rotationSeconds * 1000);
  }

  public stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }

  private async rotate(): Promise<void> {
    this.index = (this.index + 1) % RIFT_ROTATION.length;
    const modifier = RIFT_ROTATION[this.index];
    for (const match of store.matches.values()) {
      if (match.status === 'RUNNING') {
        match.riftState.modifier = modifier;
        if (this.db) {
          await this.db.upsertMatch(match);
        }
      }
    }
    await logEventWithPersistence(this.db, { playerId: null, name: 'liveops_rotation', payload: { modifier } });
  }
}
