import { NextResponse, type NextRequest } from "next/server";

// Scanner di vulnerabilità / sonde bot note (bloccati subito all'Edge)
const PROBE_RE = /(?:^|\/)(?:\.env|\.git|wp-admin|wp-login|wp-content|xmlrpc\.php|phpinfo|phpmyadmin|cgi-bin|actuator|server-status|config\.php|\.aws|\.ssh)(?:\/|$|\.)/i;
const BAD_BOT_RE = /\b(?:sqlmap|nikto|nmap|masscan|zgrab|nuclei|gobuster|dirbuster|wfuzz|hydra|acunetix|nessus|openvas|wpscan|dirsearch|feroxbuster)\b/i;
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// pagine pubbliche: landing, accesso, note legali; tutto il resto richiede la sessione (firma verificata nelle route/pagine)
const PUBLIC_EXACT = ["/", "/accedi", "/privacy", "/termini", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/favicon.ico"];
const PUBLIC_PREFIX = ["/landing/", "/api/auth/", "/_next"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";
  if (PROBE_RE.test(pathname) || BAD_BOT_RE.test(ua)) return new NextResponse("Forbidden", { status: 403 });

  // CSRF: le API che modificano dati accettano solo richieste dalla stessa origine
  if (MUTATING.has(req.method) && pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) return NextResponse.json({ error: "Richiesta cross-origin non consentita" }, { status: 403 });
      } catch {
        return NextResponse.json({ error: "Origin non valido" }, { status: 403 });
      }
    }
  }

  if (PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIX.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (req.cookies.get("sid")?.value) return NextResponse.next();
  if (pathname.startsWith("/api")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/accedi", req.url));
}
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|jpg|css|js)$).*)"] };
