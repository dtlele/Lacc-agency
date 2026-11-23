import { notFound } from "next/navigation";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toId } from "@/lib/http";
import ProjectClient from "./ProjectClient";

export const metadata = { title: "Progetto" };

export default async function Progetto({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireUser();
  const id = toId((await params).id);
  if (!id) notFound();
  // filtro per proprietario: i progetti degli altri utenti non esistono per te
  const [p] = await q<{ id: number; name: string; rows: string[]; steps: { t: string; s: string; r: number[] }[]; done: number[] }>(
    "SELECT id,name,rows,steps,done FROM projects WHERE id=$1 AND user_id=$2", [id, s.uid]);
  if (!p) notFound();
  return <ProjectClient project={p} />;
}
