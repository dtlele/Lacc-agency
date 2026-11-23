import { notFound } from "next/navigation";
import { requireUser, type Session } from "@/lib/auth";
import { loadAdminStats } from "@/app/api/admin/stats-data";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let s: Session | null = null;
  try { s = await requireUser(true); } catch { s = null; }
  if (!s) notFound();
  const stats = await loadAdminStats();
  return <AdminClient stats={JSON.parse(JSON.stringify(stats))} selfId={s.uid} />;
}
