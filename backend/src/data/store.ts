import crypto from 'node:crypto';
import type {
  AnalyticsEvent,
  AntiCheatFlag,
  Build,
  ContentReport,
  CosmeticSku,
  Match,
  Player,
  QueueEntry
} from '../types/models.js';

/**
 * Vertical-slice in-memory persistence layer (fallback when Postgres unavailable).
 */
export class InMemoryStore {
  public readonly players = new Map<string, Player>();
  public readonly queue: QueueEntry[] = [];
  public readonly matches = new Map<string, Match>();
  public readonly builds = new Map<string, Build>();
  public readonly reports = new Map<string, ContentReport>();
  public readonly analyticsEvents: AnalyticsEvent[] = [];
  public readonly antiCheatFlags = new Map<string, AntiCheatFlag>();
  public readonly storeSkus: CosmeticSku[] = [
    {
      id: 'skin-neon-runner',
      name: 'Neon Runner',
      type: 'SKIN',
      priceCents: 799,
      rarity: 'RARE',
      oddsDisclosure: 'Direct purchase item. No random odds.',
      payToWin: false
    },
    {
      id: 'emote-rift-wave',
      name: 'Rift Wave',
      type: 'EMOTE',
      priceCents: 299,
      rarity: 'UNCOMMON',
      oddsDisclosure: 'Direct purchase item. No random odds.',
      payToWin: false
    }
  ];

  /** Creates a seeded player profile honoring minor defaults. */
  public seedPlayer(username: string, isMinor = false): Player {
    const player: Player = {
      id: crypto.randomUUID(),
      username,
      level: 1,
      xp: 0,
      cosmetics: ['default_skin'],
      baseId: crypto.randomUUID(),
      settings: {
        parentalControls: isMinor,
        dailyLimitMinutes: isMinor ? 60 : 240,
        spendCapCents: isMinor ? 1500 : 10000,
        sessionReminderMinutes: 45,
        analyticsOptIn: true,
        isMinor
      },
      createdAt: new Date().toISOString()
    };
    this.players.set(player.id, player);
    return player;
  }

  /** Adds analytics events only for opt-in players (or anonymous system events). */
  public logEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): AnalyticsEvent | null {
    const player = event.playerId ? this.players.get(event.playerId) : null;
    if (player && !player.settings.analyticsOptIn) {
      return null;
    }
    const saved: AnalyticsEvent = {
      id: crypto.randomUUID(),
      playerId: event.playerId,
      name: event.name,
      payload: event.payload,
      createdAt: new Date().toISOString()
    };
    this.analyticsEvents.push(saved);
    return saved;
  }
}

export const store = new InMemoryStore();
