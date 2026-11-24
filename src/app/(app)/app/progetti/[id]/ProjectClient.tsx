"use client";
import { useState, useTransition } from "react";
import BusyOverlay from "@/components/BusyOverlay";
import { useRouter } from "next/navigation";
import PatternView from "@/components/PatternView";
import RoundsView, { type RoundsMeta } from "@/components/RoundsView";
import GuideView from "@/components/GuideView";
import type { GuideMeta } from "@/lib/guide";
import { api } from "@/lib/client";
import type { Step } from "@/lib/pattern";

export default function ProjectClient({ project }: { project: { id: number; name: string; kind: "grid" | "rounds" | "guide"; favorite?: boolean; meta: RoundsMeta & GuideMeta; rows: string[]; steps: Step[]; done: number[] } }) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition(); // resta "occupato" finché la pagina nuova non è pronta
  const [done, setDone] = useState<number[]>(project.done);
  const [err, setErr] = useState("");

  async function toggle(i: number) {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    const prev = done; setDone(next); setErr("");
    try { await api(`/api/projects/${project.id}`, "PATCH", { done: next }, true); }
    catch (x) { setDone(prev); setErr((x as Error).message); }
  }
  async function elimina() {
    if (!confirm(`Eliminare "${project.name}"?`)) return;
    try { await api(`/api/projects/${project.id}`, "DELETE"); startTransition(() => { router.push("/app/progetti"); router.refresh(); }); }
    catch (x) { setErr((x as Error).message); }
  }
  return (
    <div className="grid gap-5">
      {navigating && <BusyOverlay force />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">{project.name}</h1>
        <button className="btn btn-ghost" onClick={elimina}>Elimina progetto</button>
      </div>
      {err && <p role="alert" className="font-bold text-warn">{err}</p>}
      {project.kind === "guide"
        ? <GuideView meta={project.meta} steps={project.steps} done={done} onToggle={toggle} projectId={project.id} title={project.name} />
        : project.kind === "rounds"
        ? <RoundsView meta={project.meta} steps={project.steps} done={done} onToggle={toggle} projectId={project.id} title={project.name} />
        : <PatternView rows={project.rows} steps={project.steps} done={done} onToggle={toggle} name={project.name} />}
    </div>
  );
}
