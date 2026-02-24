import assert from 'node:assert';
import { setTimeout as wait } from 'node:timers/promises';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:8080';

async function main(): Promise<void> {
  const loginResp = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'integration_user', isMinor: true })
  });
  assert.equal(loginResp.status, 200);
  const { player } = (await loginResp.json()) as { player: { id: string } };

  const settingsResp = await fetch(`${base}/players/${player.id}/settings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ spendCapCents: 1200, sessionReminderMinutes: 30 })
  });
  assert.equal(settingsResp.status, 200);

  const catalogResp = await fetch(`${base}/store/catalog`);
  assert.equal(catalogResp.status, 200);
  const catalog = (await catalogResp.json()) as { skus: Array<{ id: string }> };
  assert.ok(catalog.skus.length > 0);

  const purchaseResp = await fetch(`${base}/store/purchase`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ player_id: player.id, sku_id: catalog.skus[0].id })
  });
  assert.ok([201, 403].includes(purchaseResp.status));

  const buildResp = await fetch(`${base}/builds/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ author_id: player.id, title: 'My Arena', asset_blob: '{"pieces":5}', tags: ['parkour'] })
  });
  assert.equal(buildResp.status, 201);

  for (let i = 0; i < 30; i += 1) {
    await fetch(`${base}/matchmaking/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        player_id: `${player.id}-${i}`,
        party_id: i < 3 ? 'party-alpha' : `party-${i}`,
        skill_rating: 1000 + (i % 10),
        preferred_modes: ['RIFT_SKIRMISH'],
        region: 'us-east',
        crossplay: true
      })
    });
  }

  await wait(500);
  const activeResp = await fetch(`${base}/admin/active-matches`);
  assert.equal(activeResp.status, 200);
  const activeMatches = (await activeResp.json()) as Array<{ id: string }>;
  assert.ok(activeMatches.length >= 1);

  const antiCheatResp = await fetch(`${base}/anti-cheat/flag`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      match_id: activeMatches[0].id,
      player_id: player.id,
      reason: 'SPEED_HACK',
      confidence: 0.92
    })
  });
  assert.equal(antiCheatResp.status, 201);

  const flagsResp = await fetch(`${base}/admin/anti-cheat/flags`);
  assert.equal(flagsResp.status, 200);

  const reportResp = await fetch(`${base}/reports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      reporter_id: player.id,
      target_type: 'BUILD',
      target_id: 'sample-build',
      reason: 'ABUSE',
      notes: 'integration check'
    })
  });
  assert.equal(reportResp.status, 201);

  const cohortResp = await fetch(`${base}/analytics/cohorts`);
  assert.equal(cohortResp.status, 200);
  const analyticsResp = await fetch(`${base}/analytics/summary`);
  assert.equal(analyticsResp.status, 200);
  const analytics = (await analyticsResp.json()) as { events: number };
  assert.ok(analytics.events > 0);

  console.log('Integration checks passed.');
}

main();
