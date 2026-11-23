import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const s = await requireUser();
  const [u] = await q<{ email: string; name: string }>("SELECT email,name FROM users WHERE id=$1", [s.uid]);
  return <AccountClient name={u?.name ?? ""} email={u?.email ?? ""} isAdmin={s.role === "admin"} />;
}
