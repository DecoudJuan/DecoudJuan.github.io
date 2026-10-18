// Animated demos for projects that can't show a screen recording: Wasp (a CLI and skills),
// Vexa (its real data is sensitive, so it plays with sample data) and the chess engine
// (the design is the point, so it walks through it chapter by chapter).
// Drawn on a canvas that fills the player screen; paused while off screen.
import { useEffect, useRef } from 'react';
import type { Lang } from '../../../data/content';

export type AnimKind = 'wasp' | 'vexa' | 'chess';

const C = { bg: '#0d0a08', ink: '#f3ead8', mut: '#b9ab93', soft: '#ddd2bd', acc: '#e0aa4f', red: '#d9634a', grn: '#6aa25a', dim: '#3a2f27', paper: '#fbf8f2', paperInk: '#1e1914' };
const L = {
  es: {
    scan: 'semgrep · gitleaks · trivy', model: 'el modelo confirma sólo lo que importa', first: '142 s · primera pasada', cached: '6 s · sólo lo que cambió',
  },
  en: {
    scan: 'semgrep · gitleaks · trivy', model: 'the model only confirms what matters', first: '142 s · first pass', cached: '6 s · only what changed',
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

/* ---------- Vexa: the same business on Windows and on the phone, step by step (sample data only) ---------- */
const VX_LEN = 4.5;
const VX = {
  es: {
    steps: [
      ['Clientes', 'Los cargás una vez y los tenés en la PC y en el celular.'],
      ['Productos', 'Precios y stock en un solo lugar, sin planillas.'],
      ['Facturas', 'Factura electrónica con ARCA en dos clics.'],
      ['Etiquetas', 'Imprimí las etiquetas de tus productos al toque.'],
    ],
    clients: ['Almacén Don José', 'Ferretería Sur', 'Kiosco La Esquina', 'Panadería El Trigal'],
    products: [['Yerba 1 kg', '$ 4.200', '38'], ['Café 500 g', '$ 6.900', '12'], ['Azúcar 1 kg', '$ 1.300', '54']],
    invoice: 'Factura B 0001-00000042', cae: 'CAE APROBADO', synced: 'sincronizado', label: 'Yerba 1 kg', win: 'Vexa · Windows', phone: 'Vexa',
  },
  en: {
    steps: [
      ['Clients', 'Add them once and have them on the PC and on the phone.'],
      ['Products', 'Prices and stock in one place, no spreadsheets.'],
      ['Invoices', 'Argentine e-invoicing (ARCA) in two clicks.'],
      ['Labels', 'Print your product labels right away.'],
    ],
    clients: ['Don José Grocery', 'Southside Hardware', 'Corner Kiosk', 'El Trigal Bakery'],
    products: [['Yerba 1 kg', '$ 4,200', '38'], ['Coffee 500 g', '$ 6,900', '12'], ['Sugar 1 kg', '$ 1,300', '54']],
    invoice: 'Invoice B 0001-00000042', cae: 'CAE APPROVED', synced: 'synced', label: 'Yerba 1 kg', win: 'Vexa · Windows', phone: 'Vexa',
  },
};

function vexa(c: CanvasRenderingContext2D, W: number, H: number, t: number, lang: Lang, st: Record<string, unknown>) {
  const v = VX[lang];
  const step = Math.floor(t / VX_LEN) % v.steps.length, k = t % VX_LEN;
  const fade = Math.min(1, k / 0.4, (VX_LEN - k) / 0.4);
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

  // step caption + progress
  const [title, line] = v.steps[step];
  txt(c, `${step + 1} / ${v.steps.length}`, 24, 26, 12, C.mut, 600, 'left', 'JetBrains Mono');
  c.globalAlpha = fade;
  txt(c, title, 70, 27, 18, C.ink, 800);
  txt(c, line, 70 + c.measureText(title).width + 14, 27, 13, C.mut, 500);
  c.globalAlpha = 1;
  v.steps.forEach((_, i) => { const x = W - 24 - (v.steps.length - i) * 42; c.fillStyle = C.dim; c.fillRect(x, 20, 36, 3); c.fillStyle = C.acc; c.fillRect(x, 20, 36 * (i < step ? 1 : i === step ? k / VX_LEN : 0), 3); });

  // frames: a Windows window and a phone, side by side
  const top = 46, fh = H - top - 18;
  const pw = Math.min(fh * 0.5, W * 0.22), dw = W - 48 - pw - 24, dx = 24, px = dx + dw + 24;
  const frame = (x: number, y: number, w: number, h: number, r: number, label: string) => {
    c.fillStyle = C.paper; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill();
    c.fillStyle = '#ece5d8'; c.beginPath(); c.roundRect(x, y, w, 24, [r, r, 0, 0]); c.fill();
    txt(c, label, x + 12, y + 16, 11, '#6b6052', 600, 'left', 'JetBrains Mono');
  };
  frame(dx, top, dw, fh, 8, v.win);
  frame(px, top, pw, fh, 18, v.phone);
  const ink = C.paperInk, soft = '#8a7f70', line1 = '#e6ddcf';
  const rowsIn = (x: number, y: number, w: number, items: string[][], rh: number, sizes: number[]) => items.forEach((it, i) => {
    const p = ease((k - 0.3 - i * 0.25) / 0.4);
    c.globalAlpha = p;
    c.fillStyle = line1; c.fillRect(x, y + i * rh + rh - 1, w, 1);
    it.forEach((cell, j) => txt(c, cell, j === 0 ? x : x + w - (it.length - j - 1) * (w * 0.22) - (j === it.length - 1 ? 0 : 0), y + i * rh + rh * 0.62, sizes[j] ?? 12, j === 0 ? ink : soft, j === 0 ? 600 : 500, j === 0 ? 'left' : 'right'));
    c.globalAlpha = 1;
  });

  const ix = dx + 18, iy = top + 40, iw = dw - 36;
  const mx = px + 12, my = top + 40, mw = pw - 24;
  if (step === 0) {
    rowsIn(ix, iy, iw, v.clients.map((n) => [n]), Math.min(40, (fh - 70) / 5), [14]);
    rowsIn(mx, my, mw, v.clients.map((n) => [n]), Math.min(34, (fh - 70) / 5), [Math.min(12, mw / 12)]);
  } else if (step === 1) {
    rowsIn(ix, iy, iw, v.products, Math.min(44, (fh - 70) / 4), [14, 13, 13]);
    rowsIn(mx, my, mw, v.products.map(([n, p]) => [n, p]), Math.min(38, (fh - 70) / 4), [Math.min(12, mw / 12), 11]);
  } else if (step === 2) {
    // invoice on the PC, the phone gets it at once
    txt(c, v.invoice, ix, iy + 18, 15, ink, 800);
    txt(c, v.clients[0], ix, iy + 38, 12, soft, 500, 'left', 'JetBrains Mono');
    v.products.forEach((p, i) => { const a = ease((k - 0.3 - i * 0.2) / 0.3); c.globalAlpha = a; txt(c, p[0], ix, iy + 70 + i * 22, 13, ink, 500); txt(c, p[1], ix + iw, iy + 70 + i * 22, 13, ink, 600, 'right'); c.globalAlpha = 1; });
    const q = Math.max(2, Math.min(4, (fh - 200) / 26)), qx = ix, qy = top + fh - 20 - 21 * q, shown = Math.floor(ease((k - 1) / 1.2) * 441);
    c.fillStyle = ink; for (let i = 0; i < shown; i++) if (qr[i]) c.fillRect(qx + (i % 21) * q, qy + Math.floor(i / 21) * q, q, q);
    if (k > 2.4) {
      const s = ease((k - 2.4) / 0.3);
      c.save(); c.translate(ix + iw * 0.72, qy + 21 * q * 0.5); c.rotate(-0.14); c.scale(1.4 - 0.4 * s, 1.4 - 0.4 * s); c.globalAlpha = s;
      c.strokeStyle = C.grn; c.lineWidth = 3; c.strokeRect(-76, -18, 152, 36); txt(c, v.cae, 0, 6, 15, C.grn, 800, 'center'); c.restore(); c.globalAlpha = 1;
      txt(c, v.invoice.split(' ').slice(0, 2).join(' '), mx, my + 20, Math.min(13, mw / 10), ink, 700);
      txt(c, '✓ ' + v.synced, mx, my + 42, 11, C.grn, 600, 'left', 'JetBrains Mono');
    }
  } else {
    // labels slide out of the printer
    const lw = Math.min(170, iw / 2.4), lh = 74;
    for (let i = 0; i < 3; i++) {
      const p = ease((k - 0.4 - i * 0.6) / 0.6), x = ix + i * (lw + 14), y = iy + 10 + (1 - p) * -30;
      c.globalAlpha = p; c.fillStyle = '#fff'; c.strokeStyle = '#d6cdbf'; c.lineWidth = 1;
      c.beginPath(); c.roundRect(x, y, lw, lh, 6); c.fill(); c.stroke();
      txt(c, v.products[i][0], x + 10, y + 20, 13, ink, 700); txt(c, v.products[i][1], x + lw - 10, y + 20, 13, ink, 700, 'right');
      for (let b = 0; b < 30; b++) { c.fillStyle = ink; c.fillRect(x + 10 + b * ((lw - 20) / 30), y + 32, (b * 7) % 3 ? 1.5 : 3, 30); }
      c.globalAlpha = 1;
    }
    txt(c, '⎙ ' + v.label + ' ×3', mx, my + 20, Math.min(12, mw / 11), ink, 600, 'left', 'JetBrains Mono');
  }
}

/* ---------- Chess & checkers: four chapters on how the engine is designed, one after the other ---------- */
const CH_LEN = 6;
const SOLID: [string, { es: string; en: string }][] = [
  ['S', { es: 'Responsabilidad única', en: 'Single responsibility' }],
  ['O', { es: 'Abierto / cerrado', en: 'Open / closed' }],
  ['L', { es: 'Sustitución de Liskov', en: 'Liskov substitution' }],
  ['I', { es: 'Segregación de interfaces', en: 'Interface segregation' }],
  ['D', { es: 'Inversión de dependencias', en: 'Dependency inversion' }],
];
const CHAPTERS: { title: { es: string; en: string }; text: { es: string; en: string }; solid: string }[] = [
  {
    title: { es: 'Los movimientos no son de la pieza', en: "Moves don't belong to the piece" },
    text: {
      es: 'Cada pieza se arma combinando reglas de movimiento independientes. La dama es recto + diagonal; una pieza nueva se agrega sin tocar las que ya existen.',
      en: 'Each piece is built by combining independent movement rules. The queen is straight + diagonal; a new piece is added without touching the existing ones.',
    },
    solid: 'SO',
  },
  {
    title: { es: 'La condición de victoria se cambia', en: 'The win condition is swappable' },
    text: {
      es: 'Ganar es otra regla enchufable: jaque mate en ajedrez, capturar todas las piezas en damas. El juego no sabe cuál está usando.',
      en: 'Winning is just another pluggable rule: checkmate in chess, capturing every piece in checkers. The game does not know which one it is using.',
    },
    solid: 'OL',
  },
  {
    title: { es: 'Un motor, dos juegos', en: 'One engine, two games' },
    text: {
      es: 'El motor depende de interfaces chicas (movimientos, reglas, victoria), no de un juego concreto. Damas es otra configuración del mismo motor.',
      en: 'The engine depends on small interfaces (moves, rules, victory), not on a concrete game. Checkers is another configuration of the same engine.',
    },
    solid: 'DI',
  },
  {
    title: { es: 'La interfaz escucha al tablero', en: 'The UI listens to the board' },
    text: {
      es: 'Con Observer, el tablero avisa cada jugada y la interfaz en Swing se actualiza sola. El modelo no conoce a quien lo dibuja.',
      en: 'With Observer, the board announces every move and the Swing UI updates itself. The model never knows who draws it.',
    },
    solid: 'SD',
  },
];
const CHESS_WORDS = {
  es: { straight: 'recto', diag: 'diagonal', l: 'salto en L', queen: 'dama = recto + diagonal', mate: 'Victoria: jaque mate', all: 'Victoria: sin piezas rivales', engine: 'Motor', moves: 'Movimientos', rules: 'Reglas', win: 'Victoria', chess: 'Ajedrez', checkers: 'Damas', ui: 'Interfaz (Swing)', log: 'Historial' },
  en: { straight: 'straight', diag: 'diagonal', l: 'L-jump', queen: 'queen = straight + diagonal', mate: 'Win: checkmate', all: 'Win: no rival pieces', engine: 'Engine', moves: 'Moves', rules: 'Rules', win: 'Victory', chess: 'Chess', checkers: 'Checkers', ui: 'UI (Swing)', log: 'History' },
};

function wrap(c: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, lh: number, size: number, col: string) {
  c.font = `500 ${size}px "Onest", sans-serif`; c.fillStyle = col; c.textAlign = 'left';
  let line = '', yy = y;
  s.split(' ').forEach((w) => {
    const test = line ? line + ' ' + w : w;
    if (c.measureText(test).width > maxW && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = test;
  });
  if (line) c.fillText(line, x, yy);
  return yy;
}

function chess(c: CanvasRenderingContext2D, W: number, H: number, t: number, lang: Lang) {
  const w = CHESS_WORDS[lang];
  const ch = Math.floor(t / CH_LEN) % CHAPTERS.length, k = t % CH_LEN;
  const fade = Math.min(1, k / 0.5, (CH_LEN - k) / 0.5);
  const side = Math.min(H - 56, W * 0.44), sq = side / 8, bx = 24, by = (H - side) / 2 - 6;
  const at = (x: number, y: number) => [bx + (x + 0.5) * sq, by + (y + 0.5) * sq];
  const board = () => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#8a6a48' : '#e9dcc4'; c.fillRect(bx + x * sq, by + y * sq, sq, sq); } };
  const mark = (x: number, y: number, col = 'rgba(224,170,79,.8)') => { const [cx, cy] = at(x, y); c.fillStyle = col; c.beginPath(); c.arc(cx, cy, sq * 0.15, 0, 7); c.fill(); };
  const piece = (x: number, y: number, white: boolean, label = '', checker = false) => {
    const [cx, cy] = at(x, y);
    c.fillStyle = checker ? (white ? '#fbf8f2' : '#7a2e22') : white ? '#fbf8f2' : '#1e1914';
    c.beginPath(); c.arc(cx, cy, sq * 0.34, 0, 7); c.fill();
    c.strokeStyle = white ? '#1e1914' : '#f3ead8'; c.lineWidth = 2; c.stroke();
    if (label) txt(c, label, cx, cy + sq * 0.12, sq * 0.36, white ? '#1e1914' : '#f3ead8', 800, 'center');
  };
  const chip = (x: number, y: number, s: string, on: boolean) => {
    c.font = '600 12px "JetBrains Mono", monospace'; const tw = c.measureText(s).width + 18;
    c.fillStyle = on ? 'rgba(224,170,79,.18)' : '#17120e'; c.fillRect(x, y, tw, 24);
    c.strokeStyle = on ? C.acc : C.dim; c.lineWidth = on ? 1.6 : 1; c.strokeRect(x + 0.5, y + 0.5, tw - 1, 23);
    txt(c, s, x + 9, y + 16, 12, on ? C.acc : C.mut, 600, 'left', 'JetBrains Mono');
    return x + tw + 8;
  };

  board();
  const px = bx + side + 32, pw = W - px - 24;
  const vy = by + side * 0.62; // where the chapter's own visual goes in the right panel
  c.globalAlpha = fade;

  if (ch === 0) {
    // the queen's moves are the union of two independent rules
    const q = [3, 4], phase = k < 2 ? 0 : k < 4 ? 1 : 2;
    const straight = phase !== 1, diag = phase !== 0;
    for (let i = 0; i < 8; i++) {
      if (straight) { if (i !== q[0]) mark(i, q[1]); if (i !== q[1]) mark(q[0], i); }
      if (diag) [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dy]) => { const x = q[0] + dx * i, y = q[1] + dy * i; if (i && x >= 0 && y >= 0 && x < 8 && y < 8) mark(x, y); });
    }
    piece(q[0], q[1], true, 'Q');
    let x = px; x = chip(x, vy, w.straight, straight); x = chip(x, vy, w.diag, diag); chip(x, vy, w.l, false);
    if (phase === 2) txt(c, w.queen, px, vy + 46, 14, C.ink, 700, 'left', 'JetBrains Mono');
  } else if (ch === 1) {
    // same game loop, two win conditions
    const checkers = k >= 3;
    if (!checkers) {
      piece(7, 0, false, 'K'); piece(5, 2, true, 'K');
      const m = ease((k - 0.8) / 0.6); piece(6 + 0 * m, 4 - 3 * m, true, 'Q');
      if (k > 1.5) { const [cx, cy] = at(7, 0); c.strokeStyle = C.red; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, sq * 0.45, 0, 7); c.stroke(); }
    } else {
      const m = ease((k - 3.6) / 0.6);
      if (m < 0.5) piece(4, 3, false, '', true);
      piece(5 - 2 * m, 4 - 2 * m - Math.sin(m * Math.PI) * 0.6, true, '', true);
    }
    chip(px, vy, checkers ? w.all : w.mate, (checkers ? k > 4.2 : k > 1.5));
  } else if (ch === 2) {
    // the engine stays; the game plugged into it changes
    const checkers = k >= 3;
    if (!checkers) { ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'].forEach((l, i) => piece(i, 7, true, l)); for (let i = 0; i < 8; i++) piece(i, 6, true, ''); }
    else for (let y = 5; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) piece(x, y, true, '', true);
    const ex = px, ey = vy - 6, ew = Math.min(pw, 300);
    c.fillStyle = '#17120e'; c.fillRect(ex, ey, ew, 70); c.strokeStyle = C.acc; c.lineWidth = 1.6; c.strokeRect(ex + 0.5, ey + 0.5, ew - 1, 69);
    txt(c, w.engine, ex + 12, ey + 22, 14, C.acc, 800);
    [w.moves, w.rules, w.win].forEach((s, i) => txt(c, '‹' + s + '›', ex + 12 + i * (ew - 24) / 3, ey + 52, 11, C.ink, 600, 'left', 'JetBrains Mono'));
    txt(c, checkers ? w.checkers : w.chess, ex + ew + 14, ey + 42, 14, C.ink, 700);
  } else {
    // a move, and the listeners react
    const m = ease((k - 0.8) / 0.7);
    piece(4, 6 - 2 * m, true, '');
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'].forEach((l, i) => piece(i, 7, true, l));
    const listeners = [w.ui, w.log];
    listeners.forEach((s, i) => {
      const lx = px + i * (Math.min(pw, 320) / 2 + 4), lw = Math.min(pw, 320) / 2 - 4;
      const on = k > 1.6 && k < 4.6;
      c.fillStyle = on ? 'rgba(224,170,79,.16)' : '#17120e'; c.fillRect(lx, vy, lw, 52);
      c.strokeStyle = on ? C.acc : C.dim; c.lineWidth = on ? 1.6 : 1; c.strokeRect(lx + 0.5, vy + 0.5, lw - 1, 51);
      txt(c, s, lx + 10, vy + 20, 12, C.ink, 700);
      txt(c, k > 1.6 ? 'e2 → e4' : '·', lx + 10, vy + 40, 12, C.acc, 600, 'left', 'JetBrains Mono');
    });
    if (k > 1.2 && k < 2.2) txt(c, 'notify()', px, vy - 10, 12, C.acc, 600, 'left', 'JetBrains Mono');
  }

  // chapter text
  c.globalAlpha = fade;
  const cp = CHAPTERS[ch];
  txt(c, `${ch + 1} / ${CHAPTERS.length}`, px, by + 16, 12, C.mut, 600, 'left', 'JetBrains Mono');
  const ty = wrap(c, cp.title[lang], px, by + 46, pw, 26, 21, C.ink);
  wrap(c, cp.text[lang], px, ty + 30, pw, 21, 14.5, C.soft);
  c.globalAlpha = 1;

  // SOLID row and chapter progress, always visible
  const sy = by + side - 76, bw = Math.min(30, pw / 6);
  SOLID.forEach(([letter], i) => {
    const on = cp.solid.includes(letter), x = px + i * (bw + 6);
    c.fillStyle = on ? C.acc : '#17120e'; c.fillRect(x, sy, bw, 30);
    c.strokeStyle = on ? C.acc : C.dim; c.strokeRect(x + 0.5, sy + 0.5, bw - 1, 29);
    txt(c, letter, x + bw / 2, sy + 21, 15, on ? C.bg : C.mut, 800, 'center');
  });
  const names = SOLID.filter(([l]) => cp.solid.includes(l)).map(([, n]) => n[lang]).join(' · ');
  c.globalAlpha = fade; wrap(c, names, px, sy + 50, pw, 16, 12.5, C.ink); c.globalAlpha = 1;
  const pgW = Math.min(pw, 320);
  CHAPTERS.forEach((_, i) => {
    const x = px + i * (pgW / CHAPTERS.length), seg = pgW / CHAPTERS.length - 6;
    c.fillStyle = C.dim; c.fillRect(x, sy + 72, seg, 3);
    const p = i < ch ? 1 : i === ch ? k / CH_LEN : 0;
    c.fillStyle = C.acc; c.fillRect(x, sy + 72, seg * p, 3);
  });
}


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
      // Scenes are laid out for a ~820×460 screen; on bigger ones everything (text included) scales up.
      const u = Math.max(1, Math.min(2.2, W / 820, H / 460)), w = W / u, h = H / u;
      c.save(); c.scale(u, u);
      if (kind === 'chess') chess(c, w, h, t, lang);
      else if (kind === 'vexa') vexa(c, w, h, t, lang, st);
      else wasp(c, w, h, t, L[lang], st);
      c.restore();
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
