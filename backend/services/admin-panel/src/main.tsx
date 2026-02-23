import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Match = { id: string; riftState: { modifier: string; intensity: number }; players: string[] };
type Analytics = { dau: number; mau: number; events: number; avgMatchDurationSeconds: number; completedMatches: number };

function App(): React.JSX.Element {
  const [modifier, setModifier] = useState('LOW_GRAVITY');
  const [matches, setMatches] = useState<Match[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reportsCount, setReportsCount] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);

  async function refresh(): Promise<void> {
    const [mRes, aRes, rRes, fRes] = await Promise.all([
      fetch('http://localhost:8080/admin/active-matches'),
      fetch('http://localhost:8080/analytics/summary'),
      fetch('http://localhost:8080/admin/reports'),
      fetch('http://localhost:8080/admin/anti-cheat/flags')
    ]);
    setMatches(await mRes.json());
    setAnalytics(await aRes.json());
    const reports = (await rRes.json()) as unknown[];
    setReportsCount(reports.length);
    const flags = (await fRes.json()) as unknown[];
    setFlagsCount(flags.length);
  }

  async function applyModifier(): Promise<void> {
    await fetch('http://localhost:8080/admin/rift-modifier', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ modifier, intensity: 2 })
    });
    await refresh();
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h1>EchoRift LiveOps Panel</h1>
      <div style={{ marginBottom: 8 }}>
        <label>
          Rift Modifier
          <input value={modifier} onChange={(e) => setModifier(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <button onClick={() => void applyModifier()} style={{ marginLeft: 12 }}>Apply</button>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div>DAU: {analytics?.dau ?? 0}</div>
        <div>MAU: {analytics?.mau ?? 0}</div>
        <div>Events: {analytics?.events ?? 0}</div>
        <div>Completed Matches: {analytics?.completedMatches ?? 0}</div>
        <div>Avg Match Duration(s): {analytics?.avgMatchDurationSeconds ?? 0}</div>
        <div>Reports: {reportsCount}</div>
        <div>Anti-Cheat Flags: {flagsCount}</div>
      </div>
      <h2>Active Matches ({matches.length})</h2>
      <ul>
        {matches.map((m) => (
          <li key={m.id}>
            {m.id} — {m.riftState.modifier} (intensity {m.riftState.intensity}) — players {m.players.length}
          </li>
        ))}
      </ul>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
