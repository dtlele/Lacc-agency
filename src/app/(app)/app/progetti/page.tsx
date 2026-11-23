import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ProjectFilters, { type ProjectItem } from "@/components/ProjectFilters";

export const metadata = { title: "I miei progetti" };

export default async function Progetti() {
  const s = await requireUser();
  const items = await q<ProjectItem>(
    "SELECT id,name,thumb,kind,category,difficulty,color,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done FROM projects WHERE user_id=$1 ORDER BY updated_at DESC", [s.uid]);
  return (
    <div className="grid gap-5">
      <h1 className="text-4xl">I miei progetti</h1>
      {items.length === 0 ? (
        <div className="card max-w-md">
          <p className="font-bold">Non hai ancora salvato nessun progetto.</p>
          <p className="mt-1 text-muted">Parti da una foto: ne ricavo lo schema e i passi.</p>
          <Link href="/app/schema" className="btn mt-4">Crea il primo schema</Link>
        </div>
      ) : (
        <ProjectFilters items={items} />
      )}
    </div>
  );
}
