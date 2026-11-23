"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

export default function AuthForm({ initialTab = "login" }: { initialTab?: "login" | "register" }) {
  const [tab, setTab] = useState(initialTab);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = Date.now(); }, [tab]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    try {
      if (tab === "login") await api("/api/auth/login", "POST", { email: f.get("email"), password: f.get("password") });
      else await api("/api/auth/register", "POST", {
        email: f.get("email"), password: f.get("password"), name: f.get("name"), code: f.get("code"),
        accept: f.get("accept") === "on", website: f.get("website"), t0: openedAt.current,
      });
      window.location.href = "/app";
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  return (
    <div>
      <div role="tablist" aria-label="Accesso" className="mb-5 grid grid-cols-2 gap-1 rounded-full border-2 border-ink bg-white p-1">
        {(["login", "register"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setErr(""); }}
            className={`min-h-10 rounded-full text-sm font-bold ${tab === t ? "bg-ink text-bg" : "text-muted"}`}>{t === "login" ? "Accedi" : "Crea account"}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {tab === "register" && <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />}
        {tab === "register" && <label className="block text-sm font-bold">Nome (facoltativo)<input name="name" autoComplete="name" className="input mt-1" /></label>}
        <label className="block text-sm font-bold">Email<input name="email" type="email" required autoComplete="email" className="input mt-1" /></label>
        <label className="block text-sm font-bold">Password{tab === "register" ? " (almeno 8 caratteri)" : ""}
          <input name="password" type="password" required minLength={tab === "register" ? 8 : undefined} autoComplete={tab === "login" ? "current-password" : "new-password"} className="input mt-1" />
        </label>
        {tab === "register" && (
          <>
            <label className="block text-sm font-bold">Codice invito (se te l&apos;hanno dato)<input name="code" autoComplete="off" className="input mt-1" /></label>
            <label className="flex items-start gap-2 text-sm text-muted">
              <input name="accept" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent)]" />
              <span>Accetto i <Link href="/termini" className="underline" target="_blank">termini</Link> e l&apos;<Link href="/privacy" className="underline" target="_blank">informativa privacy</Link>.</span>
            </label>
          </>
        )}
        {err && <p role="alert" className="rounded-xl border-2 border-warn bg-white px-3 py-2 text-sm font-bold text-warn">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Attendi…" : tab === "login" ? "Accedi" : "Crea account"}</button>
      </form>
    </div>
  );
}
