import { notFound } from "next/navigation";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toId } from "@/lib/http";
import ProjectClient from "./ProjectClient";
import ProjectMeta from "@/components/ProjectMeta";

export const metadata = { title: "Progetto" };

export default async function Progetto({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireUser();
  const id = toId((await params).id);
  if (!id) notFound();
  // filtro per proprietario: i progetti degli altri utenti non esistono per te
  const [p] = await q<{ id: number; name: string; kind: "grid" | "rounds"; meta: { shape?: string; size?: number; rounds?: number[] }; rows: string[]; steps: { t: string; s: string; r: number[] }[]; done: number[]; category: string; difficulty: string; color: string }>(
    "SELECT id,name,kind,meta,rows,steps,done,category,difficulty,color FROM projects WHERE id=$1 AND user_id=$2", [id, s.uid]);
  if (!p) notFound();
  return (
    <>
      <ProjectMeta id={p.id} category={p.category ?? ""} difficulty={p.difficulty ?? ""} color={p.color ?? ""} />
      <ProjectClient project={p} />
    </>
  );
}
