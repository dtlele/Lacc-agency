"use client";
const COLS = 22;

/** Motore 2D: trasforma una foto in una griglia di punti (# = maglia). Sfondo = colore mediano del bordo; funziona su oggetti su sfondo chiaro e uniforme. */
export function photoToGrid(img: HTMLImageElement): { rows: string[]; thumb: string; ok: boolean } {
  const w = COLS, h = Math.max(8, Math.min(30, Math.round(COLS * img.height / img.width)));
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const cx = cv.getContext("2d", { willReadFrequently: true })!;
  cx.drawImage(img, 0, 0, w, h);
  const d = cx.getImageData(0, 0, w, h).data;
  const px = (x: number, y: number) => { const i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const edge: number[][] = [];
  for (let x = 0; x < w; x++) edge.push(px(x, 0), px(x, h - 1));
  for (let y = 0; y < h; y++) edge.push(px(0, y), px(w - 1, y));
  const bg = [0, 1, 2].map((k) => edge.map((p) => p[k]).sort((a, b) => a - b)[edge.length >> 1]);
  const rows: string[] = []; let on = 0;
  for (let y = 0; y < h; y++) {
    let r = "";
    for (let x = 0; x < w; x++) {
      const p = px(x, y);
      const filled = Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) > 70;
      if (filled) on++;
      r += filled ? "#" : ".";
    }
    rows.push(r);
  }
  while (rows.length > 4 && !rows[0].includes("#")) rows.shift();
  while (rows.length > 4 && !rows[rows.length - 1].includes("#")) rows.pop();
  const t = document.createElement("canvas");
  const s = 256 / Math.max(img.width, img.height);
  t.width = Math.round(img.width * s); t.height = Math.round(img.height * s);
  t.getContext("2d")!.drawImage(img, 0, 0, t.width, t.height);
  return { rows, thumb: t.toDataURL("image/jpeg", 0.7), ok: on > w * h * 0.04 && on < w * h * 0.9 };
}
