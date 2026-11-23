"use client";
import { useState } from "react";

type U = { id: number; email: string; name: string; role: string; created_at: string; last_seen_at: string | null; projects: number };
type Stats = { users: number; new7: number; projects: number; usage: Record<string, { d1: number; d7: number }>; latest: U[] };
const LABELS: [string, string][] = [
  ["ai_user", "Richieste AI (utenti)"], ["ai_global", "Richieste AI (totale)"],
  ["video_user", "Ricerche video (utenti)"], ["video_global", "Ricerche video (totale)"],
  ["login", "Accessi"], ["register", "Nuove registrazioni"],
];
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "mai");

export default function AdminClient({ stats, selfId }: { stats: Stats; selfId: number }) {
  const [users, setUsers] = useState(stats.latest);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  async function remove(id: number) {
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    setBusy(false); setConfirm(null);
    if (r.ok) { setUsers((l) => l.filter((u) => u.id !== id)); setMsg("Utente eliminato."); } else setMsg((d as { error?: string }).error ?? "Errore");
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <h1 style={{ margin: 0 }}>Pannello admin</h1>
      <div style={{ display: "grid", gap: ".75rem", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        <div className="card"><strong style={{ fontSize: "1.6rem" }}>{stats.users}</strong><br />Utenti</div>
        <div className="card"><strong style={{ fontSize: "1.6rem" }}>{stats.new7}</strong><br />Nuovi in 7 giorni</div>
        <div className="card"><strong style={{ fontSize: "1.6rem" }}>{stats.projects}</strong><br />Progetti</div>
      </div>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Consumi</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
            <thead><tr><th align="left">Tipo</th><th align="right">Oggi</th><th align="right">7 giorni</th></tr></thead>
            <tbody>{LABELS.map(([k, l]) => (
              <tr key={k}><td>{l}</td><td align="right">{stats.usage[k]?.d1 ?? 0}</td><td align="right">{stats.usage[k]?.d7 ?? 0}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Ultimi utenti</h2>
        {msg && <p role="status" style={{ fontWeight: 700 }}>{msg}</p>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr><th align="left">Email</th><th align="left">Nome</th><th align="left">Ruolo</th><th align="left">Creato</th><th align="left">Ultimo accesso</th><th align="right">Progetti</th><th /></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}>
                <td style={{ overflowWrap: "anywhere" }}>{u.email}</td><td>{u.name}</td><td>{u.role}</td>
                <td>{fmt(u.created_at)}</td><td>{fmt(u.last_seen_at)}</td><td align="right">{u.projects}</td>
                <td align="right">{u.role === "admin" || u.id === selfId ? null : confirm === u.id ? (
                  <span style={{ display: "inline-flex", gap: ".4rem" }}>
                    <button className="chip" disabled={busy} onClick={() => remove(u.id)}>Sì, elimina</button>
                    <button className="chip" onClick={() => setConfirm(null)}>Annulla</button>
                  </span>
                ) : <button className="chip" onClick={() => setConfirm(u.id)}>Elimina</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
