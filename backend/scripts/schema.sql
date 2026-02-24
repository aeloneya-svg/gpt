CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  cosmetics JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_id UUID NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY,
  map_seed INT NOT NULL,
  players JSONB NOT NULL,
  rift_state JSONB NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  mode TEXT NOT NULL,
  region TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY,
  author_id UUID NOT NULL,
  asset_blob JSONB NOT NULL,
  rating INT NOT NULL DEFAULT 0,
  visits INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  player_id UUID,
  name TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
