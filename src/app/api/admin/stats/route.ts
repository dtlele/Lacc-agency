import { requireUser } from "@/lib/auth";
import { guard } from "@/lib/http";
import { loadAdminStats } from "../stats-data";

export const GET = () =>
  guard(async () => {
    await requireUser(true);
    return loadAdminStats();
  });
