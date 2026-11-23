import { q } from "@/lib/db";

const KINDS = ["ai_user", "ai_global", "video_user", "video_global", "login", "register"];

export type AdminUser = { id: number; email: string; name: string; role: string; created_at: string; last_seen_at: string | null; projects: number };

/** Chiamare solo dopo requireUser(true). */
export async function loadAdminStats() {
  const [c] = await q<{ users: number; new7: number; projects: number }>(
    `SELECT (SELECT count(*)::int FROM users) AS users,
            (SELECT count(*)::int FROM users WHERE created_at > now() - interval '7 days') AS new7,
            (SELECT count(*)::int FROM projects) AS projects`);
  const ev = await q<{ kind: string; d1: number; d7: number }>(
    `SELECT kind,
            (count(*) FILTER (WHERE at > now() - interval '1 day'))::int AS d1,
            count(*)::int AS d7
     FROM rate_events WHERE at > now() - interval '7 days' AND kind = ANY($1::text[]) GROUP BY kind`, [KINDS]);
  const usage: Record<string, { d1: number; d7: number }> = {};
  for (const k of KINDS) usage[k] = { d1: 0, d7: 0 };
  for (const r of ev) usage[r.kind] = { d1: r.d1, d7: r.d7 };
  const latest = await q<AdminUser>(
    `SELECT u.id,u.email,u.name,u.role,u.created_at,u.last_seen_at,
            (SELECT count(*)::int FROM projects p WHERE p.user_id=u.id) AS projects
     FROM users u ORDER BY u.created_at DESC, u.id DESC LIMIT 20`);
  return { users: c.users, new7: c.new7, projects: c.projects, usage, latest };
}

