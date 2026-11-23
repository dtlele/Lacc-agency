import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { optionalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Tutta l'area /app richiede un account valido: senza sessione si torna all'accesso. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await optionalUser();
  if (!s) redirect("/accedi");
  return <AppShell name={s.name}>{children}</AppShell>;
}
