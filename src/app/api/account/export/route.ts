import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard } from "@/lib/http";

const MAX_THUMB = 50 * 1024;

export const GET = () =>
  guard(async () => {
    const s = await requireUser();
    const [u] = await q<{ email: string; name: string; created_at: string }>("SELECT email,name,created_at FROM users WHERE id=$1", [s.uid]);
    const rows = await q<Record<string, unknown> & { thumb: string | null }>(
      "SELECT name,kind,meta,rows,steps,done,category,difficulty,color,thumb FROM projects WHERE user_id=$1 ORDER BY id", [s.uid]);
    const projects = rows.map(({ thumb, ...p }) => {
      if (!thumb) return p;
      return thumb.length > MAX_THUMB ? { ...p, thumb_omessa: true } : { ...p, thumb };
    });
    const body = JSON.stringify({ email: u?.email, nome: u?.name, creato_il: u?.created_at, progetti: projects }, null, 2);
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="filo-fantasia-dati.json"',
        "Cache-Control": "no-store",
      },
    });
  });
