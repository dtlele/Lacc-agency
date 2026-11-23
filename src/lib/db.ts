import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
let _sql: ReturnType<typeof neon> | null = null;
function conn() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL mancante");
    _sql = neon(url);
  }
  return _sql;
}
// database locale (solo sviluppo e test, senza Neon), condiviso fra tutti i moduli
const G = globalThis as unknown as { __ffPglite?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (process.env.LOCAL_PGLITE) {
    if (!G.__ffPglite) { const { PGlite } = await import("@electric-sql/pglite"); G.__ffPglite = new PGlite(process.env.LOCAL_PGLITE); }
    return (await G.__ffPglite.query(text, params)).rows as T[];
  }
  return (await (conn() as any).query(text, params)) as T[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

let ready: Promise<void> | null = null;
export function ensureSchema() {
  if (!ready) ready = init().catch((e) => { ready = null; throw e; });
  return ready;
}
const schemaVersion = () => createHash("sha1").update(init.toString()).digest("hex").slice(0, 16);

async function init() {
  const ver = schemaVersion();
  if (!process.env.LOCAL_PGLITE) {
    const cur = await q<{ value: string }>("SELECT value FROM meta WHERE key='schema_v'").catch(() => [] as { value: string }[]);
    if (cur[0]?.value === ver) return;
  }
  await q("CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT)");
  await q(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user', pw_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen_at TIMESTAMPTZ)`);
  await q("CREATE TABLE IF NOT EXISTS rate_events(id SERIAL PRIMARY KEY, kind TEXT NOT NULL, who TEXT NOT NULL, at TIMESTAMPTZ NOT NULL DEFAULT now())");
  await q("CREATE INDEX IF NOT EXISTS rate_events_idx ON rate_events(kind, who, at)");
  await q(`CREATE TABLE IF NOT EXISTS projects(
    id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, rows JSONB NOT NULL, steps JSONB NOT NULL, done JSONB NOT NULL DEFAULT '[]',
    thumb TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await q("CREATE INDEX IF NOT EXISTS projects_user ON projects(user_id, updated_at DESC)");
  await q("ALTER TABLE projects ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'grid'");
  await q("ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'");
  await q("ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT ''");
  await q("ALTER TABLE projects ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT ''");
  await q("ALTER TABLE projects ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT ''");
  await q("CREATE TABLE IF NOT EXISTS video_cache(cache_key TEXT PRIMARY KEY, query TEXT NOT NULL, videos JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  await q("CREATE TABLE IF NOT EXISTS voice_cache(cache_key TEXT PRIMARY KEY, audio BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  await q("INSERT INTO meta(key,value) VALUES('schema_v',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [ver]);
}
