import { describe, expect, test } from 'vitest';
import { Matchmaker } from '../../src/core/matchmaker.js';

const mm = new Matchmaker({
  minPlayers: 3,
  maxPlayers: 5,
  baseSkillDelta: 10,
  deltaIncreaseEverySeconds: 3,
  deltaIncreaseAmount: 30
});

describe('Matchmaker', () => {
  test('locks party first and forms match', () => {
    const now = Date.now();
    const entries = [
      { playerId: 'a', partyId: 'p1', skillRating: 1000, preferredModes: ['RIFT_SKIRMISH'], region: 'us-east', crossplay: true, queuedAt: now },
      { playerId: 'b', partyId: 'p1', skillRating: 1001, preferredModes: ['RIFT_SKIRMISH'], region: 'us-east', crossplay: true, queuedAt: now },
      { playerId: 'c', partyId: 'p2', skillRating: 1002, preferredModes: ['RIFT_SKIRMISH'], region: 'us-east', crossplay: true, queuedAt: now }
    ];
    const matches = mm.proposeMatches(entries, now + 5000);
    expect(matches.length).toBe(1);
    expect(matches[0].players.length).toBeGreaterThanOrEqual(3);
  });
});
