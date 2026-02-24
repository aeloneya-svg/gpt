import crypto from 'node:crypto';
import type { QueueEntry } from '../types/models.js';

export interface MatchProposal {
  matchId: string;
  players: QueueEntry[];
  region: string;
  mode: string;
}

export interface MatchmakerConfig {
  minPlayers: number;
  maxPlayers: number;
  baseSkillDelta: number;
  deltaIncreaseEverySeconds: number;
  deltaIncreaseAmount: number;
}

/**
 * Type-safe party-first matchmaker for EchoRift Rift Skirmish.
 * Steps mirror product pseudocode:
 * 1) accept queue entries
 * 2) lock valid parties first
 * 3) fill by closest skill with widening delta over time
 * 4) enforce crossplay + regional affinity
 */
export class Matchmaker {
  private readonly config: MatchmakerConfig;

  public constructor(config: MatchmakerConfig) {
    this.config = config;
  }

  /**
   * Attempts to build as many match proposals as possible from queue entries.
   */
  public proposeMatches(entries: QueueEntry[], nowMs: number = Date.now()): MatchProposal[] {
    const proposals: MatchProposal[] = [];
    const available = [...entries].sort((a, b) => a.queuedAt - b.queuedAt);

    while (available.length >= this.config.minPlayers) {
      const seed = available[0];
      const regionFiltered = available.filter((e) => e.region === seed.region || this.isSoftRegionCompatible(seed.region, e.region));
      const partyLocked = this.lockPartyFirst(regionFiltered, seed.partyId);
      if (partyLocked.length === 0) {
        available.shift();
        continue;
      }

      const crossplayTarget = partyLocked.every((p) => p.crossplay);
      const anchorSkill = Math.round(partyLocked.reduce((acc, p) => acc + p.skillRating, 0) / partyLocked.length);
      const selected: QueueEntry[] = [...partyLocked];

      for (const candidate of regionFiltered) {
        if (selected.length >= this.config.maxPlayers) {
          break;
        }
        if (selected.some((s) => s.playerId === candidate.playerId)) {
          continue;
        }
        if (crossplayTarget && !candidate.crossplay) {
          continue;
        }
        const waitedSeconds = Math.max(0, (nowMs - candidate.queuedAt) / 1000);
        const dynamicDelta = this.config.baseSkillDelta +
          Math.floor(waitedSeconds / this.config.deltaIncreaseEverySeconds) * this.config.deltaIncreaseAmount;
        if (Math.abs(candidate.skillRating - anchorSkill) <= dynamicDelta) {
          selected.push(candidate);
        }
      }

      if (selected.length >= this.config.minPlayers) {
        proposals.push({
          matchId: crypto.randomUUID(),
          players: selected,
          region: seed.region,
          mode: seed.preferredModes[0] ?? 'RIFT_SKIRMISH'
        });
        const remove = new Set(selected.map((s) => s.playerId));
        for (let i = available.length - 1; i >= 0; i -= 1) {
          if (remove.has(available[i].playerId)) {
            available.splice(i, 1);
          }
        }
      } else {
        break;
      }
    }

    return proposals;
  }

  private lockPartyFirst(entries: QueueEntry[], partyId: string): QueueEntry[] {
    const party = entries.filter((e) => e.partyId === partyId);
    if (party.length >= this.config.minPlayers && party.length <= this.config.maxPlayers) {
      return party;
    }
    return party.length > 0 ? [party[0]] : [];
  }

  private isSoftRegionCompatible(primary: string, candidate: string): boolean {
    const compatiblePairs = new Set(['us-east:us-west', 'eu-central:eu-west']);
    return compatiblePairs.has(`${primary}:${candidate}`) || compatiblePairs.has(`${candidate}:${primary}`);
  }
}
