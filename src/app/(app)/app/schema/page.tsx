"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PatternView from "@/components/PatternView";
import { api } from "@/lib/client";
import { photoToGrid } from "@/lib/photo";
import type { Step } from "@/lib/pattern";

type Draft = { name: string; rows: string[]; steps: Step[]; thumb: string };

export default function Crea() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setBusy(true); setMsg("Leggo la foto…"); setDraft(null); setDone([]);
    const img = new Image(); const url = URL.createObjectURL(file); img.src = url;
    try { await img.decode(); } catch { setMsg("Non riesco ad aprire questa foto."); setBusy(false); return; }
    const g = photoToGrid(img); URL.revokeObjectURL(url);
    if (!g.ok) { setMsg("Non vedo bene l'oggetto. Prova con una foto su sfondo chiaro e uniforme."); setBusy(false); return; }
    setMsg("Scrivo i passi guardando la foto…");
    try {
      const r = await api<{ name: string; steps: Step[] }>("/api/schema", "POST", { rows: g.rows, thumb: g.thumb });
      setDraft({ name: r.name, rows: g.rows, steps: r.steps, thumb: g.thumb }); setMsg("");
    } catch (x) { setMsg((x as Error).message); }
    setBusy(false);
  }
  async function salva() {
    if (!draft) return;
    setBusy(true);
    try {
      const r = await api<{ id: number }>("/api/projects", "POST", draft);
      router.push(`/app/progetti/${r.id}`);
    } catch (x) { setMsg((x as Error).message); setBusy(false); }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-4xl">Da una foto a uno schema</h1>
        <p className="mt-2 max-w-prose text-muted">Carica la foto di un oggetto su sfondo chiaro e uniforme. Ne ricavo lo schema a punti e scrivo i passi per realizzarlo.</p>
      </div>
      <div className="card grid gap-3 sm:max-w-md">
        <label className="font-bold">Scegli una foto
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="input mt-2 !py-2" />
        </label>
        <p role="status" aria-live="polite" className="min-h-6 text-sm font-bold text-muted">{msg}</p>
      </div>
      {draft && (
        <div className="fade-in grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.thumb} alt="" className="h-16 w-16 rounded-2xl border-2 border-ink object-cover" />
            <h2 className="flex-1 text-2xl">{draft.name}</h2>
            <button className="btn" onClick={salva} disabled={busy}>Salva nei progetti</button>
          </div>
          <PatternView rows={draft.rows} steps={draft.steps} done={done} onToggle={(i) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))} />
        </div>
      )}
    </div>
  );
}
