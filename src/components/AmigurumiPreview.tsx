"use client";
import { useEffect, useMemo, useRef } from "react";
import { roundsToMesh } from "@/lib/amigurumi";

const ROSA = "#ff4f8b", CONTORNO = "#3d1747", SFONDO = "#fff7ee", GIALLO = "#ffe066";

/** Anteprima 3D su canvas, senza librerie: ogni giro è un anello di punti. Si ruota trascinando. */
export default function AmigurumiPreview({ rounds, highlight }: { rounds: number[]; highlight?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mesh = useMemo(() => roundsToMesh(rounds), [rounds]);
  const view = useRef({ yaw: 0.6, pitch: 0.35, drag: false, x: 0, y: 0 });
  const hl = useRef<number | undefined>(highlight);
  hl.current = highlight;
  const meshRef = useRef(mesh);
  meshRef.current = mesh;
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now(), size = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = cv.clientWidth;
      cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const m = meshRef.current;
      ctx.fillStyle = SFONDO; ctx.fillRect(0, 0, size, size);
      if (!m.length || !size) return;
      const { yaw, pitch } = view.current;
      const scale = size * 0.82; // l'altezza totale (1) occupa l'82% del lato
      const cy = size / 2, cx = size / 2;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const gapY = scale / Math.max(1, m.length - 1);
      type P = { x: number; y: number; r: number; z: number; h: boolean };
      const back: P[] = [], front: P[] = [];
      m.forEach((ring, i) => {
        const n = Math.max(3, Math.min(ring.n, 400));
        const Y = ring.y - 0.5;
        const arc = (2 * Math.PI * ring.radius * scale) / n; // distanza tra due maglie sul giro
        const dot = Math.max(1.6, Math.min(9, Math.min(arc, gapY * 1.6) * 0.6));
        const h = hl.current === i;
        for (let j = 0; j < n; j++) {
          const a = yaw + (j / n) * Math.PI * 2;
          const x = Math.cos(a) * ring.radius, z = Math.sin(a) * ring.radius;
          const y2 = Y * cp - z * sp, z2 = Y * sp + z * cp;
          (z2 < 0 ? back : front).push({ x: cx + x * scale, y: cy - y2 * scale, r: h ? dot * 1.25 : dot, z: z2, h });
        }
      });
      for (const [list, alpha] of [[back, 0.55], [front, 1]] as const) {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2; ctx.strokeStyle = CONTORNO;
        for (const hi of [false, true]) { // il giro evidenziato sopra gli altri
          ctx.fillStyle = hi ? GIALLO : ROSA;
          for (const p of list) {
            if (p.h !== hi) continue;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };
    redraw.current = draw;

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (!reduce && !view.current.drag) view.current.yaw += dt * 0.4;
      draw();
      raf = requestAnimationFrame(loop);
    };
    resize(); draw();
    if (!reduce) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); redraw.current = () => {}; };
  }, []);

  // ridisegna quando cambiano giri o giro evidenziato (utile con movimento ridotto)
  useEffect(() => { redraw.current(); }, [mesh, highlight]);

  const v = view.current;
  const move = (dx: number, dy: number) => {
    v.yaw += dx * 0.01;
    v.pitch = Math.max(-1.2, Math.min(1.2, v.pitch + dy * 0.01));
    redraw.current();
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Anteprima 3D dell'amigurumi: ${rounds.length} giri, fino a ${Math.max(0, ...rounds)} maglie. Trascina per ruotarla.`}
      tabIndex={0}
      className="block aspect-square w-full cursor-grab rounded-2xl border-2 border-ink bg-bg active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => { v.drag = true; v.x = e.clientX; v.y = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (!v.drag) return; move(e.clientX - v.x, e.clientY - v.y); v.x = e.clientX; v.y = e.clientY; }}
      onPointerUp={() => { v.drag = false; }}
      onPointerCancel={() => { v.drag = false; }}
      onKeyDown={(e) => {
        const k: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
        if (k[e.key]) { e.preventDefault(); move(...k[e.key]); }
      }}
    />
  );
}
