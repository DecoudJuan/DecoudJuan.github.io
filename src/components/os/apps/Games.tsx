// Three pixel-art games in one window: Pingu (jump the ice, catch fish), Snake (with fish)
// and Buscaminas. Each draws on a low-resolution canvas scaled up without smoothing, with
// sprites defined pixel by pixel on the Sweetie 16 palette and the Silkscreen pixel font.
// Keyboard only reaches a game while its window is focused.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../lang';
import type { UIStrings } from '../../../data/i18n';

type G = UIStrings['games'];
type GameId = 'pingu' | 'snake' | 'mines';
const GAMES: [GameId, { es: string; en: string }][] = [
  ['pingu', { es: 'Pingu', en: 'Pingu' }],
  ['snake', { es: 'Snake', en: 'Snake' }],
  ['mines', { es: 'Buscaminas', en: 'Minesweeper' }],
];

// Sweetie 16 palette, plus a light grey for the minesweeper board.
const P: Record<string, string> = {
  k: '#1a1c2c', p: '#5d275d', r: '#b13e53', o: '#ef7d57', y: '#ffcd75', g: '#a7f070', G: '#38b764', t: '#257179',
  n: '#29366f', b: '#3b5dc9', l: '#41a6f6', c: '#73eff7', w: '#f4f4f4', s: '#94b0c2', S: '#566c86', d: '#333c57', q: '#c9d4dd',
};

const PENGU_FRONT = [
  '....ssssssss....',
  '...s.kkkkkk.s...',
  '..s.kkkkkkkk.s..',
  '.sskkkkkkkkkkss.',
  '.sskkkkkkkkkkss.',
  '.sskwwkkkkwwkss.',
  '.sskwkwkkwkwkss.',
  '.sskkkwoowkkkss.',
  '...kwwwoowwwk...',
  '..kkwwwwwwwwkk..',
  '.kkkwwwwwwwwkkk.',
  '.kkkwwwwwwwwkkk.',
  '..kkwwwwwwwwkk..',
  '...kkwwwwwwkk...',
  '....kkkkkkkk....',
];
// Side view, facing right: headphone band and cup, glasses on the white face, beak forward.
const PENGU_SIDE = [
  '......ssss......',
  '.....s.kkkk.....',
  '....s.kkkkkk....',
  '...ss.kkkkkkk...',
  '...sskkkkkkkkk..',
  '...sskkkkwwkwk..',
  '...sskkkkkkkkoo.',
  '....skkkwwwwkoo.',
  '.....kkwwwwwwk..',
  '....kkkwwwwwwk..',
  '...kkkkwwwwwwk..',
  '..kk.kkwwwwwwk..',
  '....kkkwwwwwk...',
  '.....kkkwwwkk...',
  '......kkkkkk....',
];
const RUN = ['.....oo...oo....', '......ooo.......', '....oo.....oo...'];
const FISH = ['...ooo.y', '.oooooyy', 'okooooyy', '.oooooyy', '...ooo.y'];
const MINE = ['...k...', '.kkkkk.', '.kwkkk.', 'kkkkkkk', '.kkkkk.', '.kkkkk.', '...k...'];
const FLAG = ['..rrrr.', '..rrrrr', '..rrr..', '..k....', '..k....', '.kkk...', 'kkkkk..'];

function sprite(c: CanvasRenderingContext2D, rows: string[], x: number, y: number) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch !== '.') { c.fillStyle = P[ch]; c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); }
    }
  });
}
function text(c: CanvasRenderingContext2D, s: string, x: number, y: number, col = P.w, align: CanvasTextAlign = 'left', shadow = true) {
  c.font = '8px Silkscreen, monospace';
  c.textAlign = align; c.textBaseline = 'top';
  if (shadow) { c.fillStyle = P.k; c.fillText(s, x + 1, y + 1); }
  c.fillStyle = col; c.fillText(s, x, y);
}

const best = {
  get: (k: string) => { try { return Number(localStorage.getItem('best-' + k)) || 0; } catch { return 0; } },
  set: (k: string, v: number) => { try { localStorage.setItem('best-' + k, String(v)); } catch { /* not remembered */ } },
};

/** Tiny square-wave blips, only after the player turns sound on. */
const audio = { ctx: null as AudioContext | null, on: false };
function blip(freq: number, dur = 0.08, type: OscillatorType = 'square', slide = 0) {
  if (!audio.on) return;
  try {
    audio.ctx ??= new AudioContext();
    const a = audio.ctx, o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur);
  } catch { /* no audio */ }
}

/** A low-res canvas (W×H logical pixels) scaled by an integer factor to fit its box. */
function usePixelCanvas(W: number, H: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, box = cv.parentElement!;
    cv.width = W; cv.height = H;
    const fit = () => {
      const k = Math.min(box.clientWidth / W, box.clientHeight / H);
      const s = k >= 1 ? Math.floor(k) : k;
      cv.style.width = `${W * s}px`; cv.style.height = `${H * s}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [W, H]);
  return ref;
}

/* ------------------------------------------------------------------ Pingu */
function Pingu({ active, onScore, onEnd, g }: { active: boolean; onScore: (n: number) => void; onEnd: () => void; g: G }) {
  const W = 192, H = 108, GROUND = H - 14;
  const ref = usePixelCanvas(W, H);
  const s = useRef({
    y: 0, vy: 0, sp: 1.4, score: 0, t: 0, dead: false, started: false,
    ice: [] as { x: number; w: number; h: number }[], fish: [] as { x: number; y: number }[],
    snow: Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 0.2 + Math.random() * 0.4 })),
    pops: [] as { x: number; y: number; t: number }[], mx: 0,
  });

  const draw = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext('2d')!, st = s.current;
    c.imageSmoothingEnabled = false;
    // sky: two bands joined by a dither line
    c.fillStyle = P.n; c.fillRect(0, 0, W, H);
    c.fillStyle = P.b; c.fillRect(0, 40, W, GROUND - 40);
    for (let x = 0; x < W; x += 2) { c.fillRect(x + ((x / 2) % 2), 38, 1, 1); c.fillRect(x, 36, 1, 1); }
    // mountains (slow parallax) with snow caps
    for (let x = 0; x < W; x++) {
      const wx = x + st.mx * 0.25;
      const h = 18 + Math.sin(wx * 0.045) * 9 + Math.sin(wx * 0.11) * 4;
      c.fillStyle = P.S; c.fillRect(x, GROUND - h, 1, h);
      c.fillStyle = P.q; c.fillRect(x, GROUND - h, 1, Math.max(1, (h - 16) * 0.6));
    }
    // ground: snow line, speckles moving at full speed
    c.fillStyle = P.w; c.fillRect(0, GROUND, W, H - GROUND);
    c.fillStyle = P.q; c.fillRect(0, GROUND, W, 1);
    c.fillStyle = P.s;
    for (let i = 0; i < 24; i++) c.fillRect(((i * 37 - st.mx) % W + W) % W, GROUND + 3 + ((i * 5) % 9), 2, 1);
    // ice blocks
    st.ice.forEach((o) => {
      const x = Math.round(o.x), y = GROUND - o.h;
      c.fillStyle = P.d; c.fillRect(x - 1, y - 1, o.w + 2, o.h + 1);
      c.fillStyle = P.l; c.fillRect(x, y, o.w, o.h);
      c.fillStyle = P.c; c.fillRect(x, y, o.w, 2); c.fillRect(x, y, 1, o.h);
      c.fillStyle = P.b; c.fillRect(x + o.w - 2, y + 2, 2, o.h - 2);
      c.fillStyle = P.w; c.fillRect(x + 2, y + 3, 1, 2);
    });
    // fish to catch
    st.fish.forEach((f) => sprite(c, FISH, f.x, f.y + Math.sin((st.t + f.x) * 0.15) * 1.5));
    // the penguin (blinks when it crashes)
    if (!(st.dead && Math.floor(st.t / 6) % 2)) {
      const py = GROUND - 16 - st.y;
      const f = st.y > 0 ? 0 : Math.floor(st.t / 5) % RUN.length;
      const bob = st.y === 0 && f === 1 ? -1 : 0;
      sprite(c, PENGU_SIDE, 20, py + bob);
      sprite(c, [RUN[f]], 20, py + 15);
    }
    // snow
    c.fillStyle = P.w;
    st.snow.forEach((f) => c.fillRect(Math.round(f.x), Math.round(f.y), 1, 1));
    // +10 pops
    st.pops.forEach((p) => text(c, '+10', p.x, p.y - (20 - p.t) * 0.6, P.y, 'center'));
    // HUD
    text(c, String(Math.floor(st.score)).padStart(5, '0'), W - 6, 5, P.w, 'right');
    text(c, `HI ${String(best.get('pingu')).padStart(5, '0')}`, 6, 5, P.s);
    if (!st.started) { text(c, 'PINGU', W / 2, 20, P.y, 'center'); text(c, g.start, W / 2, 50, P.w, 'center'); }
    if (st.dead) { text(c, g.over, W / 2, 20, P.r, 'center'); text(c, g.again, W / 2, 50, P.w, 'center'); }
  }, [ref, g, GROUND]);

  const jump = useCallback(() => {
    const st = s.current;
    if (st.dead || !st.started) {
      Object.assign(st, { y: 0, vy: 0, sp: 1.4, score: 0, dead: false, started: true, ice: [], fish: [], pops: [] });
      onScore(0); blip(520, 0.06); return;
    }
    if (st.y === 0) { st.vy = 5.4; blip(380, 0.12, 'square', 300); }
  }, [onScore]);

  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 0;
    const step = (now: number) => {
      acc += Math.min(100, now - last); last = now;
      const st = s.current;
      while (acc >= 1000 / 60) {
        acc -= 1000 / 60;
        st.t++;
        st.snow.forEach((f) => { f.y += f.v; f.x -= f.v * 0.6 + (st.started && !st.dead ? st.sp * 0.3 : 0); if (f.y > H) f.y = -1; if (f.x < 0) f.x += W; });
        if (!active || !st.started || st.dead) continue;
        st.mx += st.sp;
        st.vy -= 0.3; st.y = Math.max(0, st.y + st.vy); if (st.y === 0) st.vy = 0;
        st.sp = Math.min(3.6, st.sp + 0.0008);
        const lastIce = st.ice[st.ice.length - 1];
        if (!lastIce || lastIce.x < W - 70 - Math.random() * 80) st.ice.push({ x: W + 4, w: 8 + Math.floor(Math.random() * 3) * 3, h: 8 + Math.floor(Math.random() * 4) * 3 });
        if (Math.random() < 0.008) st.fish.push({ x: W + 4, y: GROUND - 26 - Math.random() * 24 });
        st.ice.forEach((o) => { o.x -= st.sp; });
        st.fish.forEach((f) => { f.x -= st.sp; });
        st.ice = st.ice.filter((o) => o.x > -20);
        const py = GROUND - 16 - st.y;
        st.fish = st.fish.filter((f) => {
          if (f.x < 20 + 14 && f.x + 8 > 22 && f.y < py + 14 && f.y + 5 > py) { st.score += 10; st.pops.push({ x: f.x + 4, y: f.y, t: 20 }); blip(880, 0.08); blip(1320, 0.1); return false; }
          return f.x > -10;
        });
        st.pops = st.pops.filter((p) => --p.t > 0);
        if (st.ice.some((o) => o.x < 20 + 13 && o.x + o.w > 20 + 3 && py + 15 > GROUND - o.h)) {
          st.dead = true; blip(220, 0.35, 'sawtooth', -160);
          if (Math.floor(st.score) > best.get('pingu')) best.set('pingu', Math.floor(st.score));
          onEnd();
        }
        st.score += 0.08;
        if (st.t % 6 === 0) onScore(Math.floor(st.score));
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const key = (e: KeyboardEvent) => { if (active && (e.code === 'Space' || e.code === 'ArrowUp')) { e.preventDefault(); jump(); } };
    document.fonts?.load('8px Silkscreen').then(draw).catch(() => {});
    raf = requestAnimationFrame(step);
    addEventListener('keydown', key);
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
  }, [active, draw, jump, onScore, onEnd, GROUND]);

  return <canvas ref={ref} className="pix" onPointerDown={(e) => { e.preventDefault(); jump(); }} aria-label="Pingu" />;
}

/* ------------------------------------------------------------------ Snake */
function Snake({ active, onScore, onEnd, g }: { active: boolean; onScore: (n: number) => void; onEnd: () => void; g: G }) {
  const COLS = 24, ROWS = 14, C = 6, W = COLS * C, H = ROWS * C;
  const ref = usePixelCanvas(W, H);
  const s = useRef({
    body: [[6, 7], [5, 7], [4, 7]] as number[][], dir: [1, 0], next: [1, 0], food: [15, 7], dead: false, started: false, flash: 0, t: 0,
    sparks: [] as { x: number; y: number; vx: number; vy: number; t: number }[],
  });

  const draw = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext('2d')!, st = s.current;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { c.fillStyle = (x + y) % 2 ? P.n : P.d; c.fillRect(x * C, y * C, C, C); }
    // fish
    sprite(c, FISH.map((r) => r.slice(0, 6)), st.food[0] * C, st.food[1] * C + 0.5);
    // snake: body with a highlight and a dark underside, head with eyes looking where it goes
    st.body.forEach(([x, y], i) => {
      const X = x * C, Y = y * C;
      c.fillStyle = st.flash && st.t % 4 < 2 ? P.r : i === 0 ? P.g : P.G;
      c.fillRect(X, Y, C, C);
      c.fillStyle = i === 0 ? P.w : P.g; c.fillRect(X + 1, Y + 1, 2, 1);
      c.fillStyle = P.t; c.fillRect(X, Y + C - 1, C, 1);
      if (i === 0) {
        const [dx, dy] = st.dir;
        const ex = dx ? (dx > 0 ? 4 : 1) : 1, ey = dy ? (dy > 0 ? 4 : 1) : 1;
        c.fillStyle = P.k;
        if (dx) { c.fillRect(X + ex, Y + 1, 1, 1); c.fillRect(X + ex, Y + 4, 1, 1); } else { c.fillRect(X + 1, Y + ey, 1, 1); c.fillRect(X + 4, Y + ey, 1, 1); }
      }
    });
    st.sparks.forEach((p) => { c.fillStyle = p.t > 6 ? P.y : P.o; c.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); });
    if (!st.started) { text(c, 'SNAKE', W / 2, 30, P.g, 'center'); text(c, g.start, W / 2, 46, P.w, 'center'); }
    if (st.dead) { text(c, g.over, W / 2, 30, P.r, 'center'); text(c, g.again, W / 2, 46, P.w, 'center'); }
  }, [ref, g, W, C, COLS, ROWS]);

  const turn = useCallback((d: number[]) => {
    const st = s.current;
    if (st.dead || !st.started) {
      Object.assign(st, { body: [[6, 7], [5, 7], [4, 7]], dir: [1, 0], next: d[0] === -1 ? [1, 0] : d, dead: false, started: true, flash: 0, sparks: [] });
      onScore(0); blip(520, 0.06); return;
    }
    if (d[0] !== -st.dir[0] || d[1] !== -st.dir[1]) st.next = d;
  }, [onScore]);

  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 0, moveAcc = 0;
    const step = (now: number) => {
      const dt = Math.min(100, now - last); last = now; acc += dt;
      const st = s.current;
      while (acc >= 1000 / 60) {
        acc -= 1000 / 60; st.t++;
        st.sparks.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.t--; });
        st.sparks = st.sparks.filter((p) => p.t > 0);
        if (st.flash) st.flash--;
      }
      if (active && st.started && !st.dead) {
        moveAcc += dt;
        const speed = Math.max(70, 130 - (st.body.length - 3) * 3);
        while (moveAcc >= speed) {
          moveAcc -= speed;
          st.dir = st.next;
          const h = [st.body[0][0] + st.dir[0], st.body[0][1] + st.dir[1]];
          if (h[0] < 0 || h[1] < 0 || h[0] >= COLS || h[1] >= ROWS || st.body.some(([x, y]) => x === h[0] && y === h[1])) {
            st.dead = true; st.flash = 30; blip(200, 0.4, 'sawtooth', -150);
            const n = st.body.length - 3; if (n > best.get('snake')) best.set('snake', n);
            onEnd(); break;
          }
          st.body.unshift(h);
          if (h[0] === st.food[0] && h[1] === st.food[1]) {
            for (let i = 0; i < 10; i++) st.sparks.push({ x: h[0] * C + 3, y: h[1] * C + 3, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.4, t: 12 + Math.random() * 6 });
            do { st.food = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; } while (st.body.some(([x, y]) => x === st.food[0] && y === st.food[1]));
            blip(660, 0.06); blip(990, 0.08);
            onScore(st.body.length - 3);
          } else st.body.pop();
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const map: Record<string, number[]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
    const key = (e: KeyboardEvent) => { const d = active && map[e.code]; if (d) { e.preventDefault(); turn(d); } };
    document.fonts?.load('8px Silkscreen').then(draw).catch(() => {});
    raf = requestAnimationFrame(step);
    addEventListener('keydown', key);
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
  }, [active, draw, turn, onScore, onEnd, C, COLS, ROWS]);

  const start = useRef<[number, number] | null>(null);
  return (
    <canvas
      ref={ref} className="pix" aria-label="Snake"
      onPointerDown={(e) => { start.current = [e.clientX, e.clientY]; }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current[0], dy = e.clientY - start.current[1];
        start.current = null;
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { if (!s.current.started || s.current.dead) turn([1, 0]); return; }
        turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
      }}
    />
  );
}

/* ------------------------------------------------------------------ Buscaminas */
type Cell = { mine: boolean; open: boolean; flag: boolean; n: number };
function Mines({ onScore, g }: { onScore: (n: number) => void; g: G }) {
  const N = 9, MINES = 10, T = 10, OX = 4, OY = 24, W = OX * 2 + N * T, H = OY + N * T + 4;
  const ref = usePixelCanvas(W, H);
  const fresh = (): Cell[] => Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  const s = useRef({ cells: fresh(), state: 'ready' as 'ready' | 'play' | 'won' | 'lost', boom: -1, t0: 0, secs: 0 });
  const [, tick] = useState(0);
  const nb = (i: number) => {
    const x = i % N, y = Math.floor(i / N), out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < N && ny < N) out.push(ny * N + nx);
    }
    return out;
  };

  const draw = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext('2d')!, st = s.current;
    c.fillStyle = P.s; c.fillRect(0, 0, W, H);
    // header: mine counter, penguin face (resets), timer
    const panel = (x: number, w: number, v: string) => { c.fillStyle = P.k; c.fillRect(x, 6, w, 12); text(c, v, x + w / 2, 7, P.r, 'center', false); };
    panel(OX, 22, String(MINES - st.cells.filter((x) => x.flag).length).padStart(3, '0'));
    panel(W - OX - 22, 22, String(Math.min(999, st.secs)).padStart(3, '0'));
    const fx = W / 2 - 8, fy = 4;
    c.fillStyle = P.w; c.fillRect(fx - 1, fy - 1, 18, 18); c.fillStyle = P.S; c.fillRect(fx + 1, fy + 1, 17, 17); c.fillStyle = P.q; c.fillRect(fx, fy, 16, 16);
    sprite(c, PENGU_FRONT.slice(0, 11), fx, fy + 3);
    if (st.state === 'lost') { c.fillStyle = P.r; [[fx + 4, fy + 8], [fx + 6, fy + 10], [fx + 6, fy + 8], [fx + 4, fy + 10], [fx + 10, fy + 8], [fx + 12, fy + 10], [fx + 12, fy + 8], [fx + 10, fy + 10]].forEach(([x, y]) => c.fillRect(x, y, 1, 1)); }
    if (st.state === 'won') { c.fillStyle = P.k; c.fillRect(fx + 3, fy + 8, 10, 2); }
    // board
    st.cells.forEach((cell, i) => {
      const x = OX + (i % N) * T, y = OY + Math.floor(i / N) * T;
      if (cell.open) {
        c.fillStyle = i === st.boom ? P.r : P.q; c.fillRect(x, y, T, T);
        c.fillStyle = P.s; c.fillRect(x, y, T, 1); c.fillRect(x, y, 1, T);
        if (cell.mine) sprite(c, MINE, x + 2, y + 2);
        else if (cell.n) text(c, String(cell.n), x + 5, y + 1, [P.b, P.G, P.r, P.p, P.o, P.t, P.k, P.S][cell.n - 1], 'center', false);
      } else {
        c.fillStyle = P.s; c.fillRect(x, y, T, T);
        c.fillStyle = P.w; c.fillRect(x, y, T - 1, 1); c.fillRect(x, y, 1, T - 1);
        c.fillStyle = P.S; c.fillRect(x + 1, y + T - 1, T - 1, 1); c.fillRect(x + T - 1, y + 1, 1, T - 1);
        if (cell.flag) sprite(c, FLAG, x + 2, y + 1);
      }
    });
  }, [ref, W, H, OX, OY, T, N]);

  useEffect(() => {
    document.fonts?.load('8px Silkscreen').then(draw).catch(() => {});
    draw();
    const id = setInterval(() => {
      const st = s.current;
      if (st.state === 'play') { st.secs = Math.floor((Date.now() - st.t0) / 1000); draw(); }
    }, 500);
    return () => clearInterval(id);
  }, [draw]);

  const reset = () => { s.current = { cells: fresh(), state: 'ready', boom: -1, t0: 0, secs: 0 }; onScore(0); draw(); tick((n) => n + 1); };
  const at = (e: React.PointerEvent | React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    if (y < OY - 2 && Math.abs(x - W / 2) < 10) return 'face';
    const cx = Math.floor((x - OX) / T), cy = Math.floor((y - OY) / T);
    return cx >= 0 && cy >= 0 && cx < N && cy < N ? cy * N + cx : null;
  };
  const open = (i: number) => {
    const st = s.current;
    if (st.state === 'won' || st.state === 'lost') { reset(); return; }
    if (st.state === 'ready') {
      // First click is always safe: mines go anywhere except this cell and its neighbours.
      const safe = new Set([i, ...nb(i)]);
      let placed = 0;
      while (placed < MINES) { const k = Math.floor(Math.random() * N * N); if (!safe.has(k) && !st.cells[k].mine) { st.cells[k].mine = true; placed++; } }
      st.cells.forEach((cell, k) => { cell.n = nb(k).filter((j) => st.cells[j].mine).length; });
      st.state = 'play'; st.t0 = Date.now();
    }
    const cell = st.cells[i];
    if (cell.flag || cell.open) return;
    if (cell.mine) {
      st.cells.forEach((x) => { if (x.mine) x.open = true; });
      st.state = 'lost'; st.boom = i; blip(160, 0.5, 'sawtooth', -120);
    } else {
      const stack = [i];
      while (stack.length) {
        const k = stack.pop()!;
        if (st.cells[k].open) continue;
        st.cells[k].open = true; st.cells[k].flag = false;
        if (st.cells[k].n === 0) nb(k).forEach((j) => { if (!st.cells[j].open && !st.cells[j].mine) stack.push(j); });
      }
      blip(700, 0.04);
      const opened = st.cells.filter((x) => x.open).length;
      onScore(opened);
      if (opened === N * N - MINES) { st.state = 'won'; best.set('mines', best.get('mines') + 1); blip(660, 0.1); blip(990, 0.2); }
    }
    draw(); tick((n) => n + 1);
  };
  const flag = (i: number) => {
    const st = s.current;
    if (st.state !== 'play' || st.cells[i].open) return;
    st.cells[i].flag = !st.cells[i].flag; blip(440, 0.04); draw(); tick((n) => n + 1);
  };
  const press = useRef<number | null>(null);
  const held = useRef(false);

  const st = s.current;
  return (
    <div className="mines-wrap">
      <canvas
        ref={ref} className="pix" aria-label="Buscaminas"
        onContextMenu={(e) => { e.preventDefault(); const i = at(e); if (typeof i === 'number') flag(i); }}
        onPointerDown={(e) => {
          held.current = false;
          if (e.pointerType !== 'mouse') {
            const i = at(e);
            if (typeof i === 'number') press.current = window.setTimeout(() => { held.current = true; flag(i); }, 420);
          }
        }}
        onPointerUp={() => { if (press.current) clearTimeout(press.current); press.current = null; }}
        onClick={(e) => {
          if (held.current) return;
          const i = at(e);
          if (i === 'face') reset(); else if (typeof i === 'number') open(i);
        }}
      />
      <p className="mines-st" aria-live="polite">{st.state === 'won' ? g.minesWon : st.state === 'lost' ? g.minesLost : `${MINES - st.cells.filter((x) => x.flag).length} ${g.minesLeft}`}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ window */
export default function Games({ focused }: { focused: boolean }) {
  const { lang, t } = useLang();
  const g = t.games;
  const [game, setGame] = useState<GameId>('pingu');
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState(false);
  const onScore = useCallback((n: number) => setScore(n), []);
  const [, bump] = useState(0);
  const onEnd = useCallback(() => bump((n) => n + 1), []);
  useEffect(() => { setScore(0); }, [game]);
  useEffect(() => { audio.on = sound; }, [sound]);
  return (
    <div className="games">
      <div className="games-tabs" role="tablist" aria-label={g.tabs}>
        {GAMES.map(([id, name]) => (
          <button key={id} type="button" role="tab" aria-selected={game === id} onClick={() => setGame(id)}>{name[lang]}</button>
        ))}
        <span className="games-score">{game === 'mines' ? `${g.cells} ${score} · ${g.won} ${best.get(game)}` : `${g.points} ${score} · ${g.best} ${best.get(game)}`}</span>
        <button type="button" className="games-snd" aria-pressed={sound} aria-label={g.sound} title={g.sound} onClick={() => setSound((v) => !v)}>{sound ? '♪' : '♪̸'}</button>
      </div>
      <div className="games-area">
        {game === 'pingu' && <Pingu active={focused} onScore={onScore} onEnd={onEnd} g={g} />}
        {game === 'snake' && <Snake active={focused} onScore={onScore} onEnd={onEnd} g={g} />}
        {game === 'mines' && <Mines onScore={onScore} g={g} />}
      </div>
      <p className="games-help">{g.help[game]}</p>
    </div>
  );
}
