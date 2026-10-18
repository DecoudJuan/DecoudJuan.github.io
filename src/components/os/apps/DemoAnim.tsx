// Animated demos for projects that can't show a screen recording: Wasp (a CLI and skills),
// Vexa (real invoices are sensitive) and the chess engine (the design is the point).
// Drawn on a canvas that fills the player screen; paused while off screen.
import { useEffect, useRef } from 'react';
import type { Lang } from '../../../data/content';

export type AnimKind = 'wasp' | 'vexa' | 'chess';

const C = { bg: '#0d0a08', ink: '#f3ead8', mut: '#9b8d78', acc: '#e0aa4f', red: '#d9634a', grn: '#6aa25a', dim: '#3a2f27', paper: '#fbf8f2', paperInk: '#1e1914' };
const L = {
  es: {
    scan: 'semgrep · gitleaks · trivy', model: 'el modelo confirma sólo lo que importa', first: '142 s · primera pasada', cached: '6 s · sólo lo que cambió',
    invoice: 'Factura B 0001-00000042', client: 'Cliente de ejemplo S.A.', cae: 'CAE APROBADO', retry: 'reintento: misma factura, no se duplica',
    strategy: ['Strategy', 'cómo se mueve cada pieza'], adapter: ['Adapter', 'mismo motor, otro juego'], observer: ['Observer', 'la interfaz escucha al tablero'],
    check: 'jaque', chess: 'ajedrez', checkers: 'damas',
  },
  en: {
    scan: 'semgrep · gitleaks · trivy', model: 'the model only confirms what matters', first: '142 s · first pass', cached: '6 s · only what changed',
    invoice: 'Invoice B 0001-00000042', client: 'Sample Client Inc.', cae: 'CAE APPROVED', retry: 'retry: same invoice, never duplicated',
    strategy: ['Strategy', 'how each piece moves'], adapter: ['Adapter', 'same engine, another game'], observer: ['Observer', 'the UI listens to the board'],
    check: 'check', chess: 'chess', checkers: 'checkers',
  },
};
type S = (typeof L)['es'];

const ease = (x: number) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function txt(c: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, weight = 500, align: CanvasTextAlign = 'left', font = 'Onest') {
  c.font = `${weight} ${size}px "${font}", sans-serif`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y);
}

/* ---------- Wasp: scanners flag files, the model confirms a few; second run only rescans changes ---------- */
function wasp(c: CanvasRenderingContext2D, W: number, H: number, t: number, s: S, st: Record<string, unknown>) {
  const cs = Math.max(12, Math.min(22, W / 34));
  const cols = Math.floor((W - 48) / cs), rows = Math.floor((H - 110) / cs);
  if (!st.cells || st.cols !== cols) {
    let seed = 9; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    st.cols = cols;
    st.cells = Array.from({ length: cols * rows }, (_, i) => { const f = r() < 0.06; return { x: 24 + (i % cols) * cs, y: 40 + Math.floor(i / cols) * cs, f, k: f && r() < 0.4, re: -9 }; });
  }
  const cells = st.cells as { x: number; y: number; f: boolean; k: boolean; re: number }[];
  const cyc = t % 11, first = 4.2, sx = 24 + (cyc / first) * (cols * cs + 8), done = cyc > first;
  txt(c, s.scan, 24, 26, 13, C.mut, 500, 'left', 'JetBrains Mono');
  if (done && Math.random() < 0.05) cells[Math.floor(Math.random() * cells.length)].re = t;
  cells.forEach((q) => {
    const seen = done || q.x < sx, flash = done && t - q.re < 0.45;
    c.globalAlpha = flash ? 1 : seen ? (q.f ? (q.k ? 1 : 0.45) : 0.18) : 0.07;
    c.fillStyle = flash || (seen && q.f) ? C.acc : C.ink;
    c.fillRect(q.x, q.y, cs - 4, cs - 4);
    if (seen && q.k && cyc > first * 0.6) { c.globalAlpha = 1; c.strokeStyle = C.red; c.lineWidth = 1.6; c.strokeRect(q.x - 2.5, q.y - 2.5, cs + 1, cs + 1); }
  });
  c.globalAlpha = 1;
  if (!done) { c.fillStyle = C.acc; c.fillRect(sx, 34, 2, rows * cs + 10); }
  txt(c, done ? '6 s' : '142 s', 24, H - 34, 30, C.acc, 800);
  txt(c, done ? s.cached : s.first, 24, H - 14, 13, C.mut, 500, 'left', 'JetBrains Mono');
  txt(c, s.model, W - 24, H - 14, 13, C.ink, 500, 'right');
}

/* ---------- Vexa: an invoice fills in, the QR builds, CAE stamp; a retry never duplicates ---------- */
function vexa(c: CanvasRenderingContext2D, W: number, H: number, t: number, s: S, st: Record<string, unknown>) {
  if (!st.qr) {
    let seed = 5; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    st.qr = Array.from({ length: 441 }, (_, i) => {
      const x = i % 21, y = Math.floor(i / 21), finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (!finder) return r() < 0.5;
      const lx = x > 13 ? x - 14 : x, ly = y > 13 ? y - 14 : y;
      return lx === 0 || ly === 0 || lx === 6 || ly === 6 || (lx > 1 && lx < 5 && ly > 1 && ly < 5);
    });
  }
  const qr = st.qr as boolean[];
  const cyc = t % 10, pw = Math.min(W * 0.5, 420), ph = H - 48, px = (W - pw) / 2, py = 24;
  c.fillStyle = C.paper; c.fillRect(px, py, pw, ph);
  txt(c, s.invoice, px + 22, py + 36, Math.max(13, pw / 24), C.paperInk, 800);
  txt(c, s.client, px + 22, py + 58, 12, '#6b6052', 500, 'left', 'JetBrains Mono');
  const rows = 5, lh = Math.min(26, (ph - 220) / rows);
  for (let i = 0; i < rows; i++) {
    const p = ease((cyc - 0.4 - i * 0.3) / 0.4), y = py + 88 + i * lh;
    c.fillStyle = '#d6cdbf'; c.fillRect(px + 22, y, (pw * 0.5) * (0.55 + ((i * 37) % 40) / 100) * p, 7);
    c.fillStyle = C.paperInk; c.fillRect(px + pw - 22 - 46 * p, y, 46 * p, 7);
  }
  const tp = ease((cyc - 2.2) / 0.4);
  c.fillStyle = C.paperInk; c.fillRect(px + pw - 22 - 90 * tp, py + 92 + rows * lh, 90 * tp, 12);
  const q = Math.max(2, Math.min(5, (ph - 190) / 30)), qx = px + 22, qy = py + ph - 22 - 21 * q;
  const shown = Math.floor(ease((cyc - 2.8) / 1.4) * 441);
  c.fillStyle = C.paperInk;
  for (let i = 0; i < shown; i++) if (qr[i]) c.fillRect(qx + (i % 21) * q, qy + Math.floor(i / 21) * q, q, q);
  if (cyc > 4.4) {
    const k = ease((cyc - 4.4) / 0.3);
    c.save(); c.translate(px + pw * 0.66, py + ph - 70); c.rotate(-0.14); c.scale(1.4 - 0.4 * k, 1.4 - 0.4 * k); c.globalAlpha = k;
    c.strokeStyle = C.grn; c.lineWidth = 3; c.strokeRect(-78, -20, 156, 40); txt(c, s.cae, 0, 7, 16, C.grn, 800, 'center'); c.restore(); c.globalAlpha = 1;
  }
  if (cyc > 6.2) {
    const k = ease((cyc - 6.2) / 0.4);
    c.globalAlpha = k; c.fillStyle = C.bg; c.fillRect(px - 8, H - 22, pw + 16, 22);
    txt(c, '↻ ' + s.retry + '  ✓', W / 2, H - 6, 13, C.acc, 600, 'center', 'JetBrains Mono'); c.globalAlpha = 1;
  }
}

/* ---------- Chess & checkers: the game plays while the pattern behind each move lights up ---------- */
function chess(c: CanvasRenderingContext2D, W: number, H: number, t: number, s: S) {
  const cyc = t % 12, isChess = cyc < 6;
  const side = Math.min(H - 48, W * 0.46), sq = side / 8, bx = 24, by = (H - side) / 2;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#8a6a48' : '#e9dcc4'; c.fillRect(bx + x * sq, by + y * sq, sq, sq); }
  const at = (x: number, y: number) => [bx + (x + 0.5) * sq, by + (y + 0.5) * sq];
  const disc = (x: number, y: number, col: string, ring: string, label = '') => {
    const [cx, cy] = at(x, y);
    c.fillStyle = col; c.beginPath(); c.arc(cx, cy, sq * 0.34, 0, 7); c.fill();
    c.strokeStyle = ring; c.lineWidth = 2; c.stroke();
    if (label) txt(c, label, cx, cy + sq * 0.12, sq * 0.36, ring, 800, 'center');
  };
  let lit = '';
  if (isChess) {
    // knight from g1 shows its legal squares, then jumps; the queen then gives check
    const k = cyc;
    if (k > 0.6 && k < 1.8) { lit = 'strategy'; [[5, 5], [7, 5], [4, 6]].forEach(([x, y]) => { const [cx, cy] = at(x, y); c.fillStyle = 'rgba(224,170,79,.75)'; c.beginPath(); c.arc(cx, cy, sq * 0.14, 0, 7); c.fill(); }); }
    const kp = ease((k - 1.8) / 0.6);
    const [nx, ny] = [6 + (5 - 6) * kp, 7 + (5 - 7) * kp];
    if (k > 1.8 && k < 3) lit = 'observer';
    disc(4, 0, '#1e1914', '#f3ead8', 'K'); disc(3, 0, '#1e1914', '#f3ead8', 'Q');
    [0, 1, 2, 5, 6, 7].forEach((x) => disc(x, 1, '#1e1914', '#f3ead8', ''));
    disc(4, 7, '#fbf8f2', '#1e1914', 'K');
    const qp = ease((k - 3.2) / 0.6);
    disc(3 + (7 - 3) * qp, 7 + (3 - 7) * qp, '#fbf8f2', '#1e1914', 'Q');
    disc(nx, ny, '#fbf8f2', '#1e1914', 'N');
    if (k > 3.9) {
      lit = 'strategy';
      const [cx, cy] = at(4, 0); c.strokeStyle = C.red; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, sq * 0.44, 0, 7); c.stroke();
      txt(c, s.check, cx, cy - sq * 0.55, 13, C.red, 800, 'center');
    }
    if (k > 5.2) lit = 'adapter';
  } else {
    // checkers: the same board, other rules; a piece jumps and captures
    const k = cyc - 6;
    if (k < 0.8) lit = 'adapter';
    const jp = ease((k - 1.4) / 0.7);
    const dark = [[1, 2], [3, 2], [5, 2], [7, 2], [0, 1], [2, 1], [4, 1], [6, 1]];
    dark.forEach(([x, y]) => { if (!(x === 3 && y === 2 && jp > 0.5)) disc(x, y, '#7a2e22', '#f3ead8'); });
    [[0, 5], [2, 5], [6, 5], [1, 6], [3, 6], [5, 6], [7, 6]].forEach(([x, y]) => disc(x, y, '#fbf8f2', '#1e1914'));
    disc(4 + (2 - 4) * jp, 3 + (1 - 3) * jp - Math.sin(jp * Math.PI) * 0.6, '#fbf8f2', '#1e1914');
    if (k > 0.8 && k < 1.4) { lit = 'strategy'; const [cx, cy] = at(2, 1); c.fillStyle = 'rgba(224,170,79,.75)'; c.beginPath(); c.arc(cx, cy, sq * 0.14, 0, 7); c.fill(); }
    if (k > 1.4 && k < 3) lit = 'observer';
    if (k > 5.2) lit = 'adapter';
  }
  txt(c, isChess ? s.chess : s.checkers, bx, by - 8, 12, C.mut, 600, 'left', 'JetBrains Mono');
  // the three patterns; the one acting now lights up
  const px = bx + side + 32, pw = W - px - 24, bh = Math.min(70, (H - 80) / 3);
  ([['strategy', s.strategy], ['adapter', s.adapter], ['observer', s.observer]] as [string, string[]][]).forEach(([id, [name, what]], i) => {
    const y = (H - (bh * 3 + 24)) / 2 + i * (bh + 12), on = lit === id;
    c.fillStyle = on ? 'rgba(224,170,79,.16)' : '#17120e'; c.fillRect(px, y, pw, bh);
    c.strokeStyle = on ? C.acc : C.dim; c.lineWidth = on ? 2 : 1; c.strokeRect(px + 0.5, y + 0.5, pw - 1, bh - 1);
    txt(c, `«${name}»`, px + 14, y + bh * 0.45, Math.min(18, pw / 12), on ? C.acc : C.ink, 800);
    txt(c, what, px + 14, y + bh * 0.78, Math.min(13, pw / 18), on ? C.ink : C.mut, 500);
    if (on && id === 'observer') txt(c, 'notify()', px + pw - 14, y + bh * 0.45, 12, C.acc, 600, 'right', 'JetBrains Mono');
  });
}

const SCENES = { wasp, vexa, chess };

export default function DemoAnim({ kind, lang }: { kind: AnimKind; lang: Lang }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, c = cv.getContext('2d')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, raf = 0, vis = true;
    const st: Record<string, unknown> = {}, t0 = performance.now();
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
      for (const k of Object.keys(st)) delete st[k];
    };
    const frame = () => {
      if (!W) return;
      c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
      const t = reduced ? 5.5 : (performance.now() - t0) / 1000;
      if (kind === 'chess') chess(c, W, H, t, L[lang]);
      else SCENES[kind](c, W, H, t, L[lang], st);
    };
    const loop = () => { frame(); raf = requestAnimationFrame(loop); };
    const run = () => { cancelAnimationFrame(raf); if (vis && !reduced) loop(); else frame(); };
    const ro = new ResizeObserver(() => { size(); run(); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; run(); });
    io.observe(cv);
    document.fonts?.ready.then(frame).catch(() => {});
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [kind, lang]);
  return <canvas ref={ref} className="demo-anim" aria-hidden="true" />;
}
