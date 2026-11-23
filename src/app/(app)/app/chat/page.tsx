"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Ciao! Dimmi cosa vuoi creare e ti aiuto con punti, filato e misure." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim(); if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const r = await api<{ reply: string }>("/api/chat", "POST", { messages: next.slice(1) });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }
  return (
    <div className="grid max-w-2xl gap-4">
      <h1 className="text-4xl">Chiedi all&apos;assistente</h1>
      <div className="card grid gap-3">
        <div className="grid max-h-[55dvh] gap-3 overflow-y-auto p-1" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl border-2 border-ink px-4 py-2 font-semibold ${m.role === "user" ? "justify-self-end rounded-br-sm bg-giallo" : "justify-self-start rounded-bl-sm bg-lilla"}`}>{m.content}</p>
          ))}
          {busy && <p className="justify-self-start rounded-2xl border-2 border-ink bg-lilla px-4 py-2 font-semibold">Sto scrivendo…</p>}
          <div ref={end} />
        </div>
        {err && <p role="alert" className="font-bold text-warn">{err}</p>}
        <form onSubmit={send} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="Scrivi qui la tua domanda" aria-label="Messaggio" className="input flex-1" />
          <button className="btn" disabled={busy || !text.trim()}>Invia</button>
        </form>
      </div>
      <p className="text-sm text-muted">Le risposte le scrive un&apos;AI: per misure e quantità controlla sempre la fascetta del tuo filato.</p>
    </div>
  );
}
