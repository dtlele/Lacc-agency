import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard, json, toId } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** Solo admin. Mai se stessi, mai un altro admin (il filtro role<>'admin' sta nella query stessa). */
export const DELETE = (_req: Request, { params }: Ctx) =>
  guard(async () => {
    const s = await requireUser(true);
    const id = toId((await params).id);
    if (!id) return json({ error: "Utente non trovato" }, 404);
    if (id === s.uid) return json({ error: "Non puoi eliminare il tuo account da qui: usa la pagina Account." }, 400);
    const gone = await q("DELETE FROM users WHERE id=$1 AND role<>'admin' RETURNING id", [id]);
    if (gone.length) return { ok: true };
    const [u] = await q("SELECT id FROM users WHERE id=$1", [id]);
    return u ? json({ error: "Non puoi eliminare un altro amministratore." }, 403) : json({ error: "Utente non trovato" }, 404);
  });
