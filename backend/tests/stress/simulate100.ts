const base = process.env.BASE_URL ?? 'http://127.0.0.1:8080';

async function main(): Promise<void> {
  const joins = Array.from({ length: 100 }).map((_, i) =>
    fetch(`${base}/matchmaking/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        player_id: `stress-${i}`,
        party_id: `stress-party-${Math.floor(i / 3)}`,
        skill_rating: 900 + (i % 200),
        preferred_modes: ['RIFT_SKIRMISH'],
        region: i % 2 === 0 ? 'us-east' : 'us-west',
        crossplay: true
      })
    })
  );

  const started = Date.now();
  const responses = await Promise.all(joins);
  const elapsedMs = Date.now() - started;
  const failures = responses.filter((r) => !r.ok).length;
  console.log(JSON.stringify({ requests: responses.length, failures, elapsedMs }, null, 2));
}

main();
