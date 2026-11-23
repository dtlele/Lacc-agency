"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PatternView from "@/components/PatternView";
import { api } from "@/lib/client";
import type { Step } from "@/lib/pattern";

export default function ProjectClient({ project }: { project: { id: number; name: string; rows: string[]; steps: Step[]; done: number[] } }) {
  const router = useRouter();
  const [done, setDone] = useState<number[]>(project.done);
  const [err, setErr] = useState("");

  async function toggle(i: number) {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    const prev = done; setDone(next); setErr("");
    try { await api(`/api/projects/${project.id}`, "PATCH", { done: next }); }
    catch (x) { setDone(prev); setErr((x as Error).message); }
  }
  async function elimina() {
    if (!confirm(`Eliminare "${project.name}"?`)) return;
    try { await api(`/api/projects/${project.id}`, "DELETE"); router.push("/app/progetti"); router.refresh(); }
    catch (x) { setErr((x as Error).message); }
  }
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">{project.name}</h1>
        <button className="btn btn-ghost" onClick={elimina}>Elimina progetto</button>
      </div>
      {err && <p role="alert" className="font-bold text-warn">{err}</p>}
      <PatternView rows={project.rows} steps={project.steps} done={done} onToggle={toggle} />
    </div>
  );
}
