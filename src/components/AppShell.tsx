"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/client";

const NAV = [
  { href: "/app", label: "Home", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/app/schema", label: "Crea", icon: "M12 5v14M5 12h14" },
  { href: "/app/progetti", label: "Progetti", icon: "M4 4h16v16H4zM4 10h16M10 4v16" },
  { href: "/app/chat", label: "Chat", icon: "M4 5h16v11H9l-5 4z" },
  { href: "/app/video", label: "Video", icon: "M5 4l14 8-14 8z" },
  { href: "/app/preferiti", label: "Preferiti", icon: "M12 21s-8.5-5.4-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 15.6 12 21 12 21z", desk: true },
  { href: "/app/amigurumi", label: "Amigurumi", icon: "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8 21l4-6 4 6", desk: true },
  { href: "/app/materiali", label: "Materiali", icon: "M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0", desk: true },
  { href: "/app/account", label: "Account", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0", desk: true },
];

export default function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = (h: string) => (h === "/app" ? path === "/app" : path.startsWith(h));
  async function esci() { await api("/api/auth/logout", "POST"); window.location.href = "/"; }
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-r-2 border-ink p-4 md:flex">
        <Link href="/app" className="mb-4 font-display text-2xl text-accent">Filo &amp; Fantasia</Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-full px-4 font-bold ${active(n.href) ? "bg-ink text-bg" : "hover:bg-rosa-chiaro"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>{n.label}
          </Link>
        ))}
        <div className="mt-auto border-t-2 border-line pt-3 text-sm">
          <p className="truncate font-bold">{name || "Il tuo account"}</p>
          <button onClick={esci} className="mt-1 font-bold text-muted underline">Esci</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="flex items-center justify-between border-b-2 border-ink px-4 py-3 md:hidden">
          <Link href="/app" className="font-display text-xl text-accent">Filo &amp; Fantasia</Link>
          <span className="flex gap-4 text-sm font-bold text-muted">
            <Link href="/app/preferiti" className="underline">Preferiti</Link><Link href="/app/amigurumi" className="underline">Amigurumi</Link><Link href="/app/materiali" className="underline">Materiali</Link><Link href="/app/account" className="underline">Account</Link>
          </span>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
      <nav aria-label="Sezioni" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t-2 border-ink bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.filter((n) => !n.desk).map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active(n.href) ? "text-accent" : "text-muted"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
