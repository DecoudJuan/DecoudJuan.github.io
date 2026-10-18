// Three small games in one window: Pingu (jump the ice), Snake (with fish) and Buscaminas.
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
const css = (el: Element, n: string) => getComputedStyle(el).getPropertyValue(n).trim();
const best = {
  get: (k: string) => { try { return Number(localStorage.getItem('best-' + k)) || 0; } catch { return 0; } },
  set: (k: string, v: number) => { try { localStorage.setItem('best-' + k, String(v)); } catch { /* not remembered */ } },
};

/** A canvas that fills its box and redraws on resize. */
function useCanvas(draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0 });
  useEffect(() => {
    const cv = ref.current!;
    const ro = new ResizeObserver(() => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      size.current = { w: r.width, h: r.height };
      cv.width = r.width * d; cv.height = r.height * d;
      cv.getContext('2d')!.setTransform(d, 0, 0, d, 0, 0);
      draw(cv.getContext('2d')!, r.width, r.height);
    });
    ro.observe(cv);
    return () => ro.disconnect();
  }, [draw]);
  return { ref, size };
}

function Pingu({ active, onScore, onEnd, g }: { active: boolean; onScore: (n: number) => void; onEnd: () => void; g: G }) {
  const s = useRef({ y: 0, vy: 0, obs: [] as { x: number; w: number; h: number }[], sp: 4.2, score: 0, dead: false, started: false });
  const draw = useCallback((c: CanvasRenderingContext2D, W: number, H: number) => {
    const st = s.current, el = c.canvas, ink = css(el, '--ink'), acc = css(el, '--acc'), gy = H - 24;
    c.clearRect(0, 0, W, H);
    c.globalAlpha = 0.25; c.fillStyle = ink; c.fillRect(0, gy, W, 2); c.globalAlpha = 1;
    const px = 44, py = gy - 36 - st.y;
    c.fillStyle = '#1e2228'; c.beginPath(); c.ellipse(px + 14, py + 19, 14, 18, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(px + 16, py + 23, 9, 12, 0, 0, 7); c.fill();
    c.fillStyle = '#f1f3f5'; c.fillRect(px + 1, py + 7, 6, 11);
    c.fillStyle = '#f0951f'; c.beginPath(); c.moveTo(px + 22, py + 13); c.lineTo(px + 31, py + 15); c.lineTo(px + 22, py + 18); c.fill();
    c.fillStyle = acc; st.obs.forEach((o) => c.fillRect(o.x, gy - o.h, o.w, o.h));
    if (st.dead || !st.started) {
      c.fillStyle = ink; c.font = '600 14px Onest, sans-serif'; c.textAlign = 'center';
      c.fillText(st.dead ? g.pinguDead : g.pinguStart, W / 2, H / 2 - 10); c.textAlign = 'left';
    }
  }, [g]);
  const { ref, size } = useCanvas(draw);

  const jump = useCallback(() => {
    const st = s.current;
    if (st.dead || !st.started) { Object.assign(st, { y: 0, vy: 0, obs: [], sp: 4.2, score: 0, dead: false, started: true }); onScore(0); return; }
    if (st.y === 0) st.vy = 10.5;
  }, [onScore]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const step = () => {
      const st = s.current, { w: W, h: H } = size.current;
      if (st.started && !st.dead && W) {
        st.vy -= 0.62; st.y = Math.max(0, st.y + st.vy); if (st.y === 0) st.vy = 0; st.sp += 0.002;
        const last = st.obs[st.obs.length - 1];
        if (!last || last.x < W - 150 - Math.random() * 170) st.obs.push({ x: W + 10, w: 14 + Math.random() * 12, h: 16 + Math.random() * 22 });
        st.obs.forEach((o) => { o.x -= st.sp; });
        st.obs = st.obs.filter((o) => o.x > -40);
        const gy = H - 24;
        if (st.obs.some((o) => o.x < 70 && o.x + o.w > 48 && gy - 36 - st.y + 34 > gy - o.h)) {
          st.dead = true; if (Math.floor(st.score) > best.get('pingu')) best.set('pingu', Math.floor(st.score)); onEnd();
        }
        st.score += 0.1; onScore(Math.floor(st.score));
      }
      if (ref.current) draw(ref.current.getContext('2d')!, W, H);
      raf = requestAnimationFrame(step);
    };
    const key = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    raf = requestAnimationFrame(step);
    addEventListener('keydown', key);
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
  }, [active, draw, jump, onScore, onEnd, ref, size]);

  return <canvas ref={ref} className="game-cv" onPointerDown={(e) => { e.preventDefault(); jump(); }} aria-label="Pingu: el pingüino salta bloques de hielo" />;
}

function Snake({ active, onScore, onEnd, g }: { active: boolean; onScore: (n: number) => void; onEnd: () => void; g: G }) {
  const COLS = 22, ROWS = 14;
  const s = useRef({ body: [[6, 7], [5, 7], [4, 7]] as number[][], dir: [1, 0], next: [1, 0], food: [14, 7], dead: false, started: false });
  const draw = useCallback((c: CanvasRenderingContext2D, W: number, H: number) => {
    const st = s.current, el = c.canvas, cell = Math.min(W / COLS, H / ROWS), ox = (W - cell * COLS) / 2, oy = (H - cell * ROWS) / 2;
    c.clearRect(0, 0, W, H);
    c.fillStyle = css(el, '--bar'); c.fillRect(ox, oy, cell * COLS, cell * ROWS);
    c.fillStyle = '#f0951f'; c.beginPath(); c.ellipse(ox + (st.food[0] + 0.5) * cell, oy + (st.food[1] + 0.5) * cell, cell * 0.38, cell * 0.24, 0, 0, 7); c.fill();
    c.fillStyle = css(el, '--ink');
    st.body.forEach(([x, y], i) => { c.globalAlpha = i ? 0.85 : 1; c.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2); });
    c.globalAlpha = 1;
    if (st.dead || !st.started) {
      c.fillStyle = css(el, '--ink'); c.font = '600 14px Onest, sans-serif'; c.textAlign = 'center';
      c.fillText(st.dead ? g.snakeDead : g.snakeStart, W / 2, H / 2); c.textAlign = 'left';
    }
  }, [g]);
  const { ref, size } = useCanvas(draw);

  const turn = useCallback((d: number[]) => {
    const st = s.current;
    if (st.dead || !st.started) { Object.assign(st, { body: [[6, 7], [5, 7], [4, 7]], dir: [1, 0], next: d[0] === -1 ? [1, 0] : d, dead: false, started: true }); onScore(0); return; }
    if (d[0] !== -st.dir[0] || d[1] !== -st.dir[1]) st.next = d;
  }, [onScore]);

  useEffect(() => {
    if (!active) return;
    const tick = setInterval(() => {
      const st = s.current;
      if (st.started && !st.dead) {
        st.dir = st.next;
        const h = [st.body[0][0] + st.dir[0], st.body[0][1] + st.dir[1]];
        if (h[0] < 0 || h[1] < 0 || h[0] >= COLS || h[1] >= ROWS || st.body.some(([x, y]) => x === h[0] && y === h[1])) {
          st.dead = true; const n = st.body.length - 3; if (n > best.get('snake')) best.set('snake', n); onEnd();
        } else {
          st.body.unshift(h);
          if (h[0] === st.food[0] && h[1] === st.food[1]) {
            do { st.food = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; } while (st.body.some(([x, y]) => x === st.food[0] && y === st.food[1]));
            onScore(st.body.length - 3);
          } else st.body.pop();
        }
      }
      if (ref.current) draw(ref.current.getContext('2d')!, size.current.w, size.current.h);
    }, 115);
    const map: Record<string, number[]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
    const key = (e: KeyboardEvent) => { const d = map[e.code]; if (d) { e.preventDefault(); turn(d); } };
    addEventListener('keydown', key);
    return () => { clearInterval(tick); removeEventListener('keydown', key); };
  }, [active, draw, turn, onEnd, ref, size]);

  const start = useRef<[number, number] | null>(null);
  return (
    <canvas
      ref={ref} className="game-cv" aria-label="Snake: comé pescados sin chocarte"
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

type Cell = { mine: boolean; open: boolean; flag: boolean; n: number };
function Mines({ onScore, g }: { onScore: (n: number) => void; g: G }) {
  const N = 9, MINES = 10;
  const fresh = () => Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  const [cells, setCells] = useState<Cell[]>(fresh);
  const [state, setState] = useState<'ready' | 'play' | 'won' | 'lost'>('ready');
  const press = useRef<number | null>(null);
  const nb = (i: number) => {
    const x = i % N, y = Math.floor(i / N), out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < N && ny < N) out.push(ny * N + nx);
    }
    return out;
  };

  const open = (i: number) => {
    if (state === 'won' || state === 'lost') { setCells(fresh()); setState('ready'); onScore(0); return; }
    let cs = cells.map((c) => ({ ...c }));
    if (state === 'ready') {
      // First click is always safe: mines go anywhere except this cell and its neighbours.
      const safe = new Set([i, ...nb(i)]);
      let placed = 0;
      while (placed < MINES) { const k = Math.floor(Math.random() * N * N); if (!safe.has(k) && !cs[k].mine) { cs[k].mine = true; placed++; } }
      cs.forEach((c, k) => { c.n = nb(k).filter((j) => cs[j].mine).length; });
      setState('play');
    }
    if (cs[i].flag || cs[i].open) return;
    if (cs[i].mine) { cs = cs.map((c) => (c.mine ? { ...c, open: true } : c)); setCells(cs); setState('lost'); return; }
    const stack = [i];
    while (stack.length) {
      const k = stack.pop()!;
      if (cs[k].open) continue;
      cs[k].open = true;
      if (cs[k].n === 0) nb(k).forEach((j) => { if (!cs[j].open && !cs[j].mine) stack.push(j); });
    }
    const opened = cs.filter((c) => c.open).length;
    onScore(opened);
    setCells(cs);
    if (opened === N * N - MINES) { setState('won'); best.set('mines', best.get('mines') + 1); }
  };
  const flag = (i: number) => {
    if (state !== 'play' || cells[i].open) return;
    setCells(cells.map((c, k) => (k === i ? { ...c, flag: !c.flag } : c)));
  };

  const flags = cells.filter((c) => c.flag).length;
  return (
    <div className="mines">
      <p className="mines-st">{state === 'won' ? g.minesWon : state === 'lost' ? g.minesLost : `${MINES - flags} ${g.minesLeft}`}</p>
      <div className="mines-grid" style={{ ['--n' as string]: N }} onContextMenu={(e) => e.preventDefault()}>
        {cells.map((c, i) => (
          <button
            key={i} type="button" className={'mc' + (c.open ? ' open' : '') + (c.open && c.mine ? ' boom' : '')} data-n={c.open && !c.mine ? c.n : undefined}
            aria-label={c.open ? (c.mine ? 'mina' : String(c.n || 'vacía')) : c.flag ? 'marcada' : 'cerrada'}
            onClick={() => { if (press.current !== -1) open(i); press.current = null; }}
            onContextMenu={(e) => { e.preventDefault(); flag(i); }}
            onPointerDown={(e) => { if (e.pointerType !== 'mouse') { const t = setTimeout(() => { flag(i); press.current = -1; }, 420); press.current = t as unknown as number; } }}
            onPointerUp={() => { if (press.current && press.current !== -1) { clearTimeout(press.current); press.current = null; } }}
          >
            {c.open ? (c.mine ? '●' : c.n || '') : c.flag ? '⚑' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Games({ focused }: { focused: boolean }) {
  const { lang, t } = useLang();
  const g = t.games;
  const [game, setGame] = useState<GameId>('pingu');
  const [score, setScore] = useState(0);
  const onScore = useCallback((n: number) => setScore(n), []);
  const [, bump] = useState(0);
  const onEnd = useCallback(() => bump((n) => n + 1), []);
  useEffect(() => { setScore(0); }, [game]);
  return (
    <div className="games">
      <div className="games-tabs" role="tablist" aria-label={g.tabs}>
        {GAMES.map(([id, name]) => (
          <button key={id} type="button" role="tab" aria-selected={game === id} onClick={() => setGame(id)}>{name[lang]}</button>
        ))}
        <span className="games-score">{game === 'mines' ? `${g.cells} ${score} · ${g.won} ${best.get(game)}` : `${g.points} ${score} · ${g.best} ${best.get(game)}`}</span>
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
