/** Public player profile model persisted in Postgres. */
export interface Player {
  id: string;
  username: string;
  level: number;
  xp: number;
  cosmetics: string[];
  baseId: string;
  settings: {
    parentalControls: boolean;
    dailyLimitMinutes: number;
    spendCapCents: number;
    sessionReminderMinutes: number;
    analyticsOptIn: boolean;
    isMinor: boolean;
  };
  createdAt: string;
}

/** Queue payload used by the matchmaker algorithm. */
export interface QueueEntry {
  playerId: string;
  partyId: string;
  skillRating: number;
  preferredModes: string[];
  region: string;
  crossplay: boolean;
  queuedAt: number;
}

/** In-memory shape of a running or pending match. */
export interface Match {
  id: string;
  mapSeed: number;
  players: string[];
  riftState: {
    modifier: string;
    intensity: number;
    tick: number;
  };
  startedAt: string;
  endedAt: string | null;
  results: Array<{ playerId: string; score: number; extracted: boolean }>;
  mode: 'RIFT_SKIRMISH' | 'SANDBOX_HUB';
  region: string;
  status: 'WAITING' | 'RUNNING' | 'COMPLETED';
  durationSeconds: number;
}

/** User-generated build model used by the hub creator economy. */
export interface Build {
  id: string;
  authorId: string;
  assetBlob: string;
  rating: number;
  visits: number;
  title: string;
  tags: string[];
  createdAt: string;
}

/** Moderation/report payload for UGC safety workflows. */
export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: 'BUILD' | 'PLAYER';
  targetId: string;
  reason: 'ABUSE' | 'HATE' | 'SELF_HARM' | 'CHEAT' | 'OTHER';
  notes: string;
  createdAt: string;
}

/** Analytics event shape for opt-in telemetry. */
export interface AnalyticsEvent {
  id: string;
  playerId: string | null;
  name: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

/** Anti-cheat flag payload used for investigation queue. */
export interface AntiCheatFlag {
  id: string;
  matchId: string;
  playerId: string;
  reason: 'AIM_ASSIST' | 'SPEED_HACK' | 'TELEPORT' | 'OTHER';
  confidence: number;
  createdAt: string;
}

/** Cosmetic storefront SKU with transparent pricing. */
export interface CosmeticSku {
  id: string;
  name: string;
  type: 'SKIN' | 'EMOTE' | 'BUNDLE';
  priceCents: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
  oddsDisclosure: string;
  payToWin: false;
}
