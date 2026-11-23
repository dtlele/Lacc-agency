"use client";
import HeartButton from "./HeartButton";
import { api } from "@/lib/client";

export default function ProjectHeart({ id, favorite }: { id: number; favorite: boolean }) {
  return (
    <div className="mb-2 flex justify-end">
      <HeartButton on={favorite} label={favorite ? "Togli dai preferiti" : "Aggiungi ai preferiti"}
        onChange={async (next) => { await api(`/api/projects/${id}`, "PATCH", { favorite: next }); }} />
    </div>
  );
}
