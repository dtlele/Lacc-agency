"use client";
import Link from "next/link";
import { useState } from "react";

async function call(url: string, method: string, body: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, error: (d as { error?: string }).error ?? "Qualcosa è andato storto. Riprova." };
}

export default function AccountClient({ name, email, isAdmin }: { name: string; email: string; isAdmin: boolean }) {
  const [cur, setCur] = useState(""); const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState(""); const [pwBusy, setPwBusy] = useState(false);
  const [delPw, setDelPw] = useState(""); const [sure, setSure] = useState(false);
  const [delMsg, setDelMsg] = useState(""); const [delBusy, setDelBusy] = useState(false);

  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwBusy(true); setPwMsg("");
    const r = await call("/api/account/password", "POST", { current: cur, next });
    setPwBusy(false);
    if (r.ok) { setCur(""); setNext(""); setPwMsg("Password cambiata."); } else setPwMsg(r.error);
  }
  async function del(e: React.FormEvent) {
    e.preventDefault(); setDelBusy(true); setDelMsg("");
    const r = await call("/api/account", "DELETE", { password: delPw });
    if (r.ok) { window.location.href = "/"; return; }
    setDelBusy(false); setDelMsg(r.error);
  }

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 560 }}>
      <h1 style={{ margin: 0 }}>Il tuo account</h1>
      <section className="card">
        <p style={{ margin: 0 }}><strong>{name || "Senza nome"}</strong></p>
        <p style={{ margin: ".25rem 0 0", overflowWrap: "anywhere" }}>{email}</p>
        {isAdmin && <p style={{ margin: ".75rem 0 0" }}><Link className="btn btn-ghost" href="/app/admin">Pannello admin</Link></p>}
      </section>

      <form className="card" onSubmit={changePw} style={{ display: "grid", gap: ".6rem" }}>
        <h2 style={{ margin: 0 }}>Cambia password</h2>
        <input className="input" type="password" autoComplete="current-password" placeholder="Password attuale" value={cur} onChange={(e) => setCur(e.target.value)} required />
        <input className="input" type="password" autoComplete="new-password" placeholder="Nuova password (almeno 8 caratteri)" minLength={8} maxLength={200} value={next} onChange={(e) => setNext(e.target.value)} required />
        <button className="btn" disabled={pwBusy}>{pwBusy ? "Salvo..." : "Cambia password"}</button>
        {pwMsg && <p role="status" style={{ margin: 0, fontWeight: 700 }}>{pwMsg}</p>}
      </form>

      <section className="card" style={{ display: "grid", gap: ".6rem" }}>
        <h2 style={{ margin: 0 }}>I tuoi dati</h2>
        <p style={{ margin: 0 }}>Scarica un file con il tuo profilo e tutti i tuoi progetti.</p>
        <a className="btn btn-ghost" href="/api/account/export" download>Scarica i miei dati</a>
      </section>

      <form className="card" onSubmit={del} style={{ display: "grid", gap: ".6rem" }}>
        <h2 style={{ margin: 0 }}>Elimina account</h2>
        <p style={{ margin: 0 }}>Cancelli per sempre il tuo account e tutti i tuoi progetti. Non si può annullare.</p>
        <input className="input" type="password" autoComplete="current-password" placeholder="La tua password" value={delPw} onChange={(e) => setDelPw(e.target.value)} required />
        <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontWeight: 600 }}>
          <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} /> Ho capito: voglio eliminare tutto.
        </label>
        <button className="btn" disabled={!sure || !delPw || delBusy}>{delBusy ? "Elimino..." : "Elimina il mio account"}</button>
        {delMsg && <p role="alert" style={{ margin: 0, fontWeight: 700 }}>{delMsg}</p>}
      </form>
    </div>
  );
}
