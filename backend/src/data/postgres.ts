import { Pool } from 'pg';
import type { AnalyticsEvent, Build, ContentReport, Match, Player } from '../types/models.js';

/**
 * Optional Postgres adapter. On failure, callers should fall back to in-memory store.
 */
export class PostgresAdapter {
  private readonly pool: Pool;

  public constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  /** Health check query for DB availability. */
  public async ping(): Promise<boolean> {
    try {
      await this.pool.query('select 1');
      return true;
    } catch {
      return false;
    }
  }

  /** Persists a player row. */
  public async upsertPlayer(player: Player): Promise<void> {
    await this.pool.query(
      `INSERT INTO players (id, username, level, xp, cosmetics, base_id, settings, created_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8)
       ON CONFLICT (id) DO UPDATE
       SET username = EXCLUDED.username, level = EXCLUDED.level, xp = EXCLUDED.xp, cosmetics = EXCLUDED.cosmetics, settings = EXCLUDED.settings`,
      [
        player.id,
        player.username,
        player.level,
        player.xp,
        JSON.stringify(player.cosmetics),
        player.baseId,
        JSON.stringify(player.settings),
        player.createdAt
      ]
    );
  }

  /** Persists a match row. */
  public async upsertMatch(match: Match): Promise<void> {
    await this.pool.query(
      `INSERT INTO matches (id, map_seed, players, rift_state, started_at, ended_at, results, mode, region)
       VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7::jsonb,$8,$9)
       ON CONFLICT (id) DO UPDATE
       SET rift_state = EXCLUDED.rift_state, ended_at = EXCLUDED.ended_at, results = EXCLUDED.results`,
      [
        match.id,
        match.mapSeed,
        JSON.stringify(match.players),
        JSON.stringify(match.riftState),
        match.startedAt,
        match.endedAt,
        JSON.stringify(match.results),
        match.mode,
        match.region
      ]
    );
  }

  /** Persists a creator build row. */
  public async insertBuild(build: Build): Promise<void> {
    await this.pool.query(
      `INSERT INTO builds (id, author_id, asset_blob, rating, visits, title, tags, created_at)
       VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7::jsonb,$8)`,
      [build.id, build.authorId, build.assetBlob, build.rating, build.visits, build.title, JSON.stringify(build.tags), build.createdAt]
    );
  }

  /** Persists a moderation report. */
  public async insertReport(report: ContentReport): Promise<void> {
    await this.pool.query(
      `INSERT INTO reports (id, reporter_id, target_type, target_id, reason, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [report.id, report.reporterId, report.targetType, report.targetId, report.reason, report.notes, report.createdAt]
    );
  }

  /** Persists an analytics event. */
  public async insertAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO analytics_events (id, player_id, name, payload, created_at)
       VALUES ($1,$2,$3,$4::jsonb,$5)`,
      [event.id, event.playerId, event.name, JSON.stringify(event.payload), event.createdAt]
    );
  }
}
