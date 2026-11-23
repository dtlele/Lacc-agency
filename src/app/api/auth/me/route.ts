import { guard, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export const GET = () =>
  guard(async () => {
    const s = await requireUser();
    return json({ name: s.name, role: s.role });
  });
