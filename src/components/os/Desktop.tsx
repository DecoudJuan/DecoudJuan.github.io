// The whole desktop: owns window state (geometry, z-order, status, animations), language,
// wallpaper and search, and wires the menu bar, icons, widgets, windows and dock together.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Window from './Window';
import Dock, { type DockItem } from './Dock';
import NetBackground from './NetBackground';
import Penguin from './Penguin';
import Spotlight, { type SpotItem } from './Spotlight';
import About from './apps/About';
import Records from './apps/Records';
import Player from './apps/Player';
import Terminal from './apps/Terminal';
import Hire from './apps/Hire';
import Games from './apps/Games';
import Music from './apps/Music';
import Notes from './apps/Notes';
import Cv from './apps/Cv';
import Trash from './apps/Trash';
import { toggleTheme } from './theme';
import { ICONS, LINK_ICONS } from './icons';
import { LangCtx, storeLang, storedLang, useLang } from './lang';
import type { Lang } from '../../data/content';
import { NOTES } from '../../data/notes';
import type { OpenTarget } from '../../data/fs';
import type { Anim, AppId, Rect, WinState } from './types';

const MENU = 34, DOCK = 92;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const META: Record<AppId, { minW: number; minH: number; variant?: 'dark' | 'inv' }> = {
  about: { minW: 340, minH: 260 }, records: { minW: 320, minH: 260 }, player: { minW: 380, minH: 300 },
  terminal: { minW: 320, minH: 180, variant: 'dark' }, games: { minW: 360, minH: 320 }, hire: { minW: 320, minH: 230, variant: 'inv' },
  music: { minW: 320, minH: 260 }, notes: { minW: 380, minH: 280 }, cv: { minW: 360, minH: 300 }, trash: { minW: 320, minH: 240 },
};
const ORDER: AppId[] = ['about', 'records', 'player', 'terminal', 'notes', 'music', 'games', 'cv', 'hire', 'trash'];
/** Apps shown in the menu bar, the desktop icons and the phone home screen. */
const LAUNCH: AppId[] = ['about', 'records', 'notes', 'music', 'terminal', 'games', 'cv', 'hire'];
const WALLS = ['auto', 'roble', 'nogal', 'noche'] as const;

/** Desktop icon grid: cells counted from the top-right corner of the desk. */
type Cell = { c: number; r: number };
const CELL_W = 100, CELL_H = 96, GRID_X = 4, GRID_Y = MENU + 8;
const key = (x: Cell) => `${x.c}:${x.r}`;
const gridFor = (W: number, H: number) => ({ cols: Math.max(1, Math.floor((W - GRID_X) / CELL_W)), rows: Math.max(1, Math.floor((H - GRID_Y - DOCK) / CELL_H)) });
function nearestFree(want: Cell, taken: Set<string>, g: { cols: number; rows: number }): Cell {
  for (let d = 0; d < g.cols + g.rows; d++) {
    for (let dc = -d; dc <= d; dc++) for (let dr = -d; dr <= d; dr++) {
      if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
      const c = { c: want.c + dc, r: want.r + dr };
      if (c.c >= 0 && c.r >= 0 && c.c < g.cols && c.r < g.rows && !taken.has(key(c))) return c;
    }
  }
  return want;
}
/** Saved cells where they still fit; everything else fills the right-hand columns top to bottom. */
function placeIcons(saved: Partial<Record<AppId, Cell>>, g: { cols: number; rows: number }): Record<AppId, Cell> {
  const out = {} as Record<AppId, Cell>, taken = new Set<string>();
  LAUNCH.forEach((id) => {
    const s = saved[id];
    if (s && s.c < g.cols && s.r < g.rows && !taken.has(key(s))) { out[id] = s; taken.add(key(s)); }
  });
  let n = 0;
  LAUNCH.forEach((id) => {
    if (out[id]) return;
    let c: Cell;
    do { c = { c: Math.floor(n / g.rows), r: n % g.rows }; n++; } while (taken.has(key(c)));
    out[id] = c; taken.add(key(c));
  });
  return out;
}
type Wall = (typeof WALLS)[number];

/** Initial layout as a function of the desk size, so big screens get big windows instead of empty wood. */
function layout(W: number, H: number): Record<AppId, Rect> {
  const top = MENU + 14, bottom = H - DOCK, side = W > 1500 ? 280 : 120, usable = W - side, avail = bottom - top;
  const about = { x: Math.round(usable * 0.03), y: top, w: clamp(usable * 0.4, 380, 900), h: clamp(avail * 0.46, 300, 540) };
  const recX = Math.round(about.x + about.w + usable * 0.03);
  const records = { x: recX, y: top + 18, w: clamp(usable - recX - usable * 0.02, 340, 1100), h: clamp(avail * 0.55, 320, 660) };
  const termY = about.y + about.h + 18;
  const terminal = { x: Math.round(usable * 0.05), y: termY, w: clamp(about.w * 0.9, 320, 820), h: clamp(bottom - termY - 12, 180, 480) };
  const hireH = clamp(avail * 0.5, 440, 560);
  const hire = { x: Math.max(0, Math.min(recX + 40, W - side - 670)), y: Math.min(records.y + records.h + 18, bottom - hireH - 10), w: clamp(records.w * 0.9, 660, 980), h: hireH };
  const pW = clamp(W * 0.8, 380, 1560);
  // Height = 16:9 video (width minus the side panel and the two arrows) + the strip of demos,
  // so the window opens hugging its content instead of leaving empty space.
  const vidW = pW - 32 - clamp(pW * 0.3, 260, 400) - 14 - 2 * (40 + 16);
  const player = { x: Math.round((W - pW) / 2), y: top, w: pW, h: clamp((vidW * 9) / 16 + 112 + 14 + 32 + 40 + 4, 320, avail - 10) };
  const centred = (w: number, h: number, dx = 0, dy = 0) => ({ x: Math.round((W - w) / 2 + dx), y: Math.round(top + (avail - h) / 2 + dy), w, h });
  return {
    about, records, terminal, hire, player,
    games: centred(clamp(W * 0.42, 380, 760), clamp(avail * 0.62, 340, 580), 0, -10),
    notes: centred(clamp(W * 0.5, 400, 900), clamp(avail * 0.7, 320, 640), -30, -20),
    music: centred(clamp(W * 0.34, 360, 560), clamp(avail * 0.8, 520, 640), 120, 0),
    cv: centred(clamp(W * 0.42, 380, 760), clamp(avail * 0.9, 340, 980), 40, 0),
    trash: centred(clamp(W * 0.36, 340, 620), clamp(avail * 0.6, 280, 520), 80, 20),
  };
}

function Clock({ lang }: { lang: Lang }) {
  const [t, setT] = useState('--:--');
  useEffect(() => {
    const f = new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [lang]);
  return <span>BUE {t}</span>;
}

export default function Desktop() {
  const [lang, setLangState] = useState<Lang>('es');
  useEffect(() => { const l = storedLang(); if (l) { setLangState(l); document.documentElement.lang = l; } }, []);
  const setLang = useCallback((l: Lang) => { setLangState(l); storeLang(l); }, []);
  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <Os />
    </LangCtx.Provider>
  );
}

function Os() {
  const { lang, setLang, t, c } = useLang();
  const desk = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const [wins, setWins] = useState<Record<AppId, WinState>>(() => {
    const L = layout(1280, 800);
    const open: AppId[] = ['about', 'records', 'terminal', 'hire'];
    return Object.fromEntries(ORDER.map((id, i) => [id, { id, rect: L[id], status: open.includes(id) ? 'open' : 'closed', max: false, z: 10 + i, anim: null }])) as Record<AppId, WinState>;
  });
  const [focus, setFocus] = useState<AppId>('about');
  const [project, setProject] = useState(c.PROJECTS[0].id);
  const [note, setNote] = useState(NOTES[0].id);
  const [boot, setBoot] = useState<'on' | 'out' | 'off'>('off');
  // The server render can't know the screen size: windows and icons stay hidden (still in the
  // HTML for search engines) until the first measurement, so nothing jumps on load.
  const [ready, setReady] = useState(false);
  const [spot, setSpot] = useState(false);
  const [wall, setWall] = useState<Wall>('auto');
  const [wallMenu, setWallMenu] = useState(false);
  const z = useRef(20);
  // Desktop selection: click selects an icon, drag on empty wood draws a selection box.
  const [sel, setSel] = useState<AppId[]>([]);
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const iconRefs = useRef<Partial<Record<AppId, HTMLButtonElement | null>>>({});
  // Icons live on a grid, like Windows: the desk is split into cells counted from the top-right
  // corner. Dragging moves the icon freely; on drop it snaps to the nearest free cell.
  const [cells, setCells] = useState<Partial<Record<AppId, Cell>>>({});
  const [drag, setDrag] = useState<{ ids: AppId[]; dx: number; dy: number; target: Cell | null } | null>(null);
  const dragged = useRef(false);
  /** Where each dropped icon was on screen when the mouse let go, so it slides from there to its cell. */
  const landing = useRef<Partial<Record<AppId, DOMRect>> | null>(null);
  useEffect(() => { try { setCells(JSON.parse(localStorage.getItem('icon-cells') || '{}')); } catch { /* ignore */ } }, []);
  useLayoutEffect(() => {
    const from = landing.current;
    if (!from) return;
    landing.current = null;
    (Object.keys(from) as AppId[]).forEach((k) => {
      const el = iconRefs.current[k], r = from[k];
      if (!el || !r) return;
      el.style.transition = 'none';
      el.style.transform = '';
      const now = el.getBoundingClientRect();
      el.style.transform = `translate(${r.left - now.left}px, ${r.top - now.top}px)`;
      void el.getBoundingClientRect();
      el.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 320);
    });
  }, [cells]);
  const grid = gridFor(size.w, size.h);
  const placed = placeIcons(cells, grid);
  const dragIcon = (id: AppId) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const ids = sel.includes(id) ? sel : [id];
    const sx = e.clientX, sy = e.clientY, el = e.currentTarget, from = placed[id];
    let moved = false, target: Cell | null = null;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      // Cells are counted from the right edge, so moving right lowers the column.
      target = { c: clamp(Math.round(from.c - dx / CELL_W), 0, grid.cols - 1), r: clamp(Math.round(from.r + dy / CELL_H), 0, grid.rows - 1) };
      setDrag({ ids, dx, dy, target });
    };
    const up = () => {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      if (!moved || !target) { setDrag(null); return; }
      landing.current = Object.fromEntries(ids.map((k) => [k, iconRefs.current[k]!.getBoundingClientRect()]));
      setDrag(null);
      dragged.current = true;
      const dc = target.c - from.c, dr = target.r - from.r;
      setCells(() => {
        const next: Partial<Record<AppId, Cell>> = { ...placed };
        const taken = new Set(LAUNCH.filter((k) => !ids.includes(k)).map((k) => key(placed[k])));
        ids.forEach((k) => {
          const want = { c: clamp(placed[k].c + dc, 0, grid.cols - 1), r: clamp(placed[k].r + dr, 0, grid.rows - 1) };
          const spot = nearestFree(want, taken, grid);
          taken.add(key(spot));
          next[k] = spot;
        });
        try { localStorage.setItem('icon-cells', JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };

  // Track the desk size; windows the user hasn't touched follow the responsive layout.
  useLayoutEffect(() => {
    const el = desk.current!;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setSize({ w, h });
      const L = layout(w, h);
      setWins((ws) => {
        const next = { ...ws };
        ORDER.forEach((id) => {
          const s = ws[id];
          if (s.max) next[id] = { ...s, rect: { x: 8, y: MENU + 6, w: w - 16, h: h - DOCK - MENU - 6 } };
          else if (!s.touched) next[id] = { ...s, rect: L[id] };
          else next[id] = { ...s, rect: { ...s.rect, x: clamp(s.rect.x, -s.rect.w + 120, w - 120), y: clamp(s.rect.y, MENU + 6, h - DOCK - 36) } };
        });
        return next;
      });
    };
    // Measure right away (before the first client paint), then follow resizes.
    fit();
    // Phones start on the home screen: no windows open.
    if (matchMedia('(max-width: 760px)').matches) {
      setWins((ws) => Object.fromEntries(ORDER.map((id) => [id, { ...ws[id], status: 'closed' }])) as Record<AppId, WinState>);
    }
    setReady(true);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Boot screen once per session; stored wallpaper; Ctrl/Cmd + K for search.
  useEffect(() => {
    try { const w = localStorage.getItem('wall') as Wall | null; if (w && WALLS.includes(w)) setWall(w); } catch { /* ignore */ }
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSpot((s) => !s); } };
    addEventListener('keydown', key);
    let seen = false;
    try { seen = sessionStorage.getItem('boot') === '1'; } catch { /* ignore */ }
    if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => removeEventListener('keydown', key);
    setBoot('on');
    const a = setTimeout(() => setBoot('out'), 1400), b = setTimeout(() => setBoot('off'), 1900);
    try { sessionStorage.setItem('boot', '1'); } catch { /* ignore */ }
    return () => { clearTimeout(a); clearTimeout(b); removeEventListener('keydown', key); };
  }, []);

  const pickWall = (w: Wall) => { setWall(w); setWallMenu(false); try { localStorage.setItem('wall', w); } catch { /* ignore */ } };

  const patch = useCallback((id: AppId, p: Partial<WinState>) => setWins((ws) => ({ ...ws, [id]: { ...ws[id], ...p } })), []);
  const raise = useCallback((id: AppId) => { setFocus(id); patch(id, { z: ++z.current }); }, [patch]);
  const bounds = useCallback(() => ({ w: size.w, top: MENU + 6, bottom: size.h - DOCK }), [size]);

  const open = useCallback((id: AppId) => {
    setWins((ws) => {
      const s = ws[id];
      const anim: Anim | null = s.status === 'min' ? 'restoring' : s.status === 'closed' ? 'opening' : null;
      return { ...ws, [id]: { ...s, status: 'open', anim, z: ++z.current } };
    });
    setFocus(id);
  }, []);

  const toggleMax = useCallback((id: AppId) => {
    setWins((ws) => {
      const s = ws[id];
      const next: WinState = s.max
        ? { ...s, max: false, rect: s.prev ?? s.rect, maxAnim: true }
        : { ...s, max: true, prev: s.rect, rect: { x: 8, y: MENU + 6, w: size.w - 16, h: size.h - DOCK - MENU - 6 }, maxAnim: true, touched: true };
      return { ...ws, [id]: next };
    });
    setTimeout(() => patch(id, { maxAnim: false }), 420);
    raise(id);
  }, [size, patch, raise]);

  const animEnd = useCallback((id: AppId, a: Anim) => {
    if (a === 'minimizing') patch(id, { status: 'min', anim: null });
    else if (a === 'closing') patch(id, { status: 'closed', anim: null, max: false });
    else patch(id, { anim: null });
  }, [patch]);

  const dockClick = (id: AppId) => {
    const s = wins[id];
    if (s.status === 'open' && focus === id) patch(id, { anim: 'minimizing' });
    else open(id);
  };

  const openProject = useCallback((pid: string) => { setProject(pid); open('player'); }, [open]);
  const openNote = useCallback((nid: string) => { setNote(nid); open('notes'); }, [open]);
  const openTarget = (x: OpenTarget) => {
    if ('project' in x) openProject(x.project);
    else if ('note' in x) openNote(x.note);
    else open(x.app as AppId);
  };

  const spotItems = useMemo<SpotItem[]>(() => [
    ...LAUNCH.map((id) => ({ id: 'a-' + id, kind: t.spot.app, label: t.app[id][0], run: () => open(id) })),
    { id: 'a-trash', kind: t.spot.app, label: t.app.trash[0], run: () => open('trash') },
    ...c.PROJECTS.map((p) => ({ id: 'p-' + p.id, kind: t.spot.project, label: p.name, sub: p.kind, run: () => openProject(p.id) })),
    ...NOTES.map((n) => ({ id: 'n-' + n.id, kind: t.spot.note, label: n.title[lang], run: () => openNote(n.id) })),
    { id: 'x-theme', kind: t.spot.action, label: t.action.theme, run: () => toggleTheme() },
    { id: 'x-lang', kind: t.spot.action, label: t.action.lang, run: () => setLang(lang === 'es' ? 'en' : 'es') },
    ...WALLS.map((w) => ({ id: 'x-wall-' + w, kind: t.spot.action, label: `${t.action.wall} ${t.wall[w]}`, run: () => pickWall(w) })),
  ], [t, c, lang, open, openProject, openNote, setLang]);

  const current = c.PROJECTS.find((p) => p.id === project) ?? c.PROJECTS[0];
  const content: Record<AppId, ReactNode> = {
    about: <About />,
    records: <Records onOpen={openProject} />,
    player: <Player project={current} onPick={setProject} />,
    terminal: <Terminal focused={focus === 'terminal'} onOpen={openTarget} onTheme={() => toggleTheme()} onExit={() => patch('terminal', { anim: 'closing' })} />,
    // Mounted only while open, so the game loops don't run behind a closed window.
    games: wins.games.status === 'open' ? <Games focused={focus === 'games'} /> : null,
    hire: <Hire />,
    music: <Music />,
    notes: <Notes current={note} onPick={setNote} />,
    cv: <Cv />,
    trash: <Trash />,
  };
  const item = (id: AppId): DockItem => ({ id, label: t.app[id][0], icon: ICONS[id], running: wins[id].status !== 'closed' });
  const links = [
    { label: 'GitHub', href: c.PERSON.github, icon: LINK_ICONS.github },
    { label: 'LinkedIn', href: c.PERSON.linkedin, icon: LINK_ICONS.linkedin },
  ];

  return (
    <div
      className={'desk' + (ready ? ' ready' : '')} ref={desk} data-wall={wall}
      onPointerDown={(e) => {
        const tgt = e.target as HTMLElement;
        // Only the bare desk starts a selection: not windows, icons, menu, dock or widgets.
        if (e.button !== 0 || e.pointerType !== 'mouse' || !(tgt === desk.current || tgt.classList.contains('grain') || tgt.classList.contains('net'))) return;
        setWallMenu(false);
        const r = desk.current!.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        setSel([]);
        setBox({ x0: x, y0: y, x1: x, y1: y });
        desk.current!.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!box) return;
        const r = desk.current!.getBoundingClientRect(), x1 = e.clientX - r.left, y1 = e.clientY - r.top;
        setBox({ ...box, x1, y1 });
        const L = Math.min(box.x0, x1) + r.left, R = Math.max(box.x0, x1) + r.left, T = Math.min(box.y0, y1) + r.top, B = Math.max(box.y0, y1) + r.top;
        setSel(LAUNCH.filter((id) => {
          const b = iconRefs.current[id]?.getBoundingClientRect();
          return !!b && b.right > L && b.left < R && b.bottom > T && b.top < B;
        }));
      }}
      onPointerUp={() => setBox(null)}
      onPointerCancel={() => setBox(null)}
    >
      <div className="grain" aria-hidden="true" />
      <NetBackground />

      <div className="menu">
        <span className="brand"><Penguin still className="menu-pm" />DecoudJuan</span>
        <span className="apps">
          {LAUNCH.map((id) => <button key={id} type="button" onClick={() => open(id)}>{t.app[id][0]}</button>)}
        </span>
        <span className="r">
          <button type="button" aria-label={t.menu.search} title="Ctrl + K" onClick={() => setSpot(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
          <span className="wall-wrap">
            <button type="button" aria-label={t.menu.wall} aria-expanded={wallMenu} onClick={() => setWallMenu((v) => !v)}>
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m4 17 5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </button>
            {wallMenu && (
              <span className="wall-menu" role="menu">
                {WALLS.map((w) => <button key={w} type="button" role="menuitemradio" aria-checked={wall === w} onClick={() => pickWall(w)}><i data-w={w} />{t.wall[w]}</button>)}
              </span>
            )}
          </span>
          <button type="button" className="lang-btn" aria-label={t.menu.lang} onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>{lang === 'es' ? 'ES' : 'EN'}</button>
          <button type="button" aria-label={t.menu.theme} onClick={(e) => toggleTheme(e)}>&#9681;</button>
          <Clock lang={lang} />
        </span>
      </div>

      <div className="icons" role="group" aria-label={t.desk}>
        {drag?.target && (
          <span className="cell-hint" aria-hidden="true" style={{ right: GRID_X + drag.target.c * CELL_W, top: GRID_Y + drag.target.r * CELL_H, width: CELL_W, height: CELL_H }} />
        )}
        {LAUNCH.map((id) => {
          const at = placed[id], moving = drag?.ids.includes(id);
          return (
            <button
              key={id} type="button" ref={(el) => { iconRefs.current[id] = el; }}
              className={'icon' + (sel.includes(id) ? ' sel' : '') + (moving ? ' moving' : '')} aria-pressed={sel.includes(id)}
              style={{ right: GRID_X + at.c * CELL_W, top: GRID_Y + at.r * CELL_H, transform: moving ? `translate(${drag!.dx}px, ${drag!.dy}px)` : undefined }}
              onPointerDown={dragIcon(id)}
              // Mouse: click selects, double-click opens (like a desktop). Touch and keyboard: open right away.
              onClick={(e) => {
                if (dragged.current) { dragged.current = false; return; }
                if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') { if (!sel.includes(id) || sel.length > 1) setSel([id]); } else open(id);
              }}
              onDoubleClick={() => { setSel([]); open(id); }}
            >
              <span className="ic">{ICONS[id]}</span><span className="lb">{t.app[id][0]}</span>
            </button>
          );
        })}
      </div>

      <div className="widgets">
        <aside className="note" aria-label={t.now}>
          <b>{t.now}</b>
          <ul>{c.NOW.map(([k, v]) => <li key={k}><strong>{k}</strong> {v}</li>)}</ul>
        </aside>
      </div>

      <nav className="home" aria-label={t.home}>
        {LAUNCH.map((id) => (
          <button key={id} type="button" onClick={() => open(id)}>
            <span className="ic">{ICONS[id]}</span><span className="lb">{t.app[id][0]}</span>
          </button>
        ))}
      </nav>

      {ORDER.map((id) => (
        <Window
          key={id}
          win={wins[id]}
          title={id === 'player' ? `${t.app.player[1]} · ${current.name}` : t.app[id][1]}
          focused={focus === id}
          variant={META[id].variant}
          minW={META[id].minW}
          minH={META[id].minH}
          bounds={bounds}
          onFocus={() => { if (focus !== id || wins[id].z < z.current) raise(id); }}
          onRect={(r) => patch(id, { rect: r, touched: true })}
          onRequest={(a) => patch(id, { anim: a })}
          onToggleMax={() => toggleMax(id)}
          onAnimEnd={(a) => animEnd(id, a)}
        >
          {content[id]}
        </Window>
      ))}

      {box && (
        <div className="marquee" aria-hidden="true" style={{ left: Math.min(box.x0, box.x1), top: Math.min(box.y0, box.y1), width: Math.abs(box.x1 - box.x0), height: Math.abs(box.y1 - box.y0) }} />
      )}

      <Dock items={(['about', 'records', 'player', 'notes', 'music', 'terminal', 'games', 'cv', 'hire'] as AppId[]).map(item)} links={links} tail={[item('trash')]} onApp={dockClick} />

      {spot && <Spotlight items={spotItems} placeholder={t.spot.placeholder} empty={t.spot.empty} onClose={() => setSpot(false)} />}

      {boot !== 'off' && (
        <div className={'boot' + (boot === 'out' ? ' out' : '')} onClick={() => setBoot('off')} aria-hidden="true">
          <Penguin still className="boot-pm" />
          <b>DecoudJuan</b>
          <span className="pb"><i /></span>
        </div>
      )}
    </div>
  );
}
