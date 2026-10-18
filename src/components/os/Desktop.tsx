// The whole desktop: owns window state (geometry, z-order, status, animations) and wires
// the menu bar, desktop icons, the "Ahora" note, the windows and the dock together.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Window from './Window';
import Dock, { type DockItem } from './Dock';
import NetBackground from './NetBackground';
import Penguin from './Penguin';
import About from './apps/About';
import Records from './apps/Records';
import Player from './apps/Player';
import Terminal from './apps/Terminal';
import Hire from './apps/Hire';
import { toggleTheme } from './theme';
import { NOW, PERSON, PROJECTS } from '../../data/content';
import type { OpenTarget } from '../../data/fs';
import type { Anim, AppId, Rect, WinState } from './types';

const MENU = 34, DOCK = 92;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const APPS: Record<AppId, { title: string; label: string; minW: number; minH: number; variant?: 'dark' | 'inv' }> = {
  about: { title: '~/sobre-mi.txt', label: 'Sobre mí', minW: 340, minH: 260 },
  records: { title: '~/discos', label: 'Discos', minW: 320, minH: 260 },
  player: { title: 'reproductor', label: 'Reproductor', minW: 380, minH: 300 },
  terminal: { title: 'juan@decoudjuan: ~', label: 'Terminal', minW: 320, minH: 180, variant: 'dark' },
  hire: { title: 'Trabajemos juntos', label: 'Trabajemos juntos', minW: 320, minH: 230, variant: 'inv' },
};
const ORDER: AppId[] = ['about', 'records', 'player', 'terminal', 'hire'];

/** Initial layout as a function of the desk size, so big screens get big windows instead of empty wood. */
function layout(W: number, H: number): Record<AppId, Rect> {
  const top = MENU + 12, bottom = H - DOCK, side = W > 1500 ? 260 : 120;
  const usable = W - side;
  const leftW = clamp(usable * 0.42, 360, 720), rightX = clamp(usable * 0.47, 400, usable - 340);
  const aboutH = clamp((bottom - top) * 0.46, 280, 470);
  const recW = clamp(usable - rightX - 24, 340, 760), recH = clamp((bottom - top) * 0.58, 300, 600);
  const termY = top + aboutH + 16, hireY = top + recH + 30;
  const pW = clamp(W * 0.72, 380, 1280);
  return {
    about: { x: Math.round(usable * 0.03), y: top, w: leftW, h: aboutH },
    records: { x: rightX, y: top + 18, w: recW, h: recH },
    terminal: { x: Math.round(usable * 0.05), y: termY, w: clamp(leftW * 0.92, 320, 660), h: clamp(bottom - termY - 10, 180, 420) },
    hire: { x: rightX + 30, y: hireY, w: clamp(recW * 0.75, 320, 560), h: clamp(bottom - hireY - 8, 230, 320) },
    player: { x: Math.round((W - pW) / 2), y: top, w: pW, h: clamp(bottom - top - 10, 300, pW * 0.62) },
  };
}

const ICONS: Record<AppId, ReactNode> = {
  about: <Penguin interactive={false} follow={false} className="dk-pm" />,
  records: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#17120e" /><circle cx="12" cy="12" r="7" fill="none" stroke="#3a2f27" strokeWidth=".8" /><circle cx="12" cy="12" r="5" fill="none" stroke="#3a2f27" strokeWidth=".8" /><circle cx="12" cy="12" r="3.2" fill="var(--acc)" /><circle cx="12" cy="12" r=".9" fill="#17120e" /></svg>,
  player: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="var(--ink)" /><path d="M10 9v6l5-3z" fill="var(--acc)" /></svg>,
  terminal: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="3" fill="#15110d" /><path d="M6.5 9.5l3 2.5-3 2.5M11.5 15h5" fill="none" stroke="#e0aa4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  hire: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2.5" fill="var(--ink)" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" fill="none" stroke="var(--ink)" strokeWidth="2" /><rect x="10.5" y="11" width="3" height="2.4" rx=".6" fill="var(--acc)" /></svg>,
};
const LINKS = [
  { label: 'GitHub', href: PERSON.github, icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--ink)" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" /></svg> },
  { label: 'LinkedIn', href: PERSON.linkedin, icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="var(--ink)" /><path d="M7.5 10v6.5M7.5 7.3v.1M11 16.5V10m0 3c0-2 1-3 2.6-3S16 11 16 13v3.5" stroke="var(--win)" strokeWidth="2" strokeLinecap="round" fill="none" /></svg> },
];

function Clock() {
  const [t, setT] = useState('--:--');
  useEffect(() => {
    const f = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span>BUE {t}</span>;
}

export default function Desktop() {
  const desk = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const [wins, setWins] = useState<Record<AppId, WinState>>(() => {
    const L = layout(1280, 800);
    const open: AppId[] = ['about', 'records', 'terminal', 'hire'];
    return Object.fromEntries(ORDER.map((id, i) => [id, { id, rect: L[id], status: open.includes(id) ? 'open' : 'closed', max: false, z: 10 + i, anim: null }])) as Record<AppId, WinState>;
  });
  const [focus, setFocus] = useState<AppId>('about');
  const [project, setProject] = useState(PROJECTS[0].id);
  const [boot, setBoot] = useState<'on' | 'out' | 'off'>('off');
  const z = useRef(20);

  // Track the desk size; windows the user hasn't touched follow the responsive layout.
  useLayoutEffect(() => {
    const el = desk.current!;
    const ro = new ResizeObserver(() => {
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
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Boot screen, once per session.
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('boot') === '1'; } catch { /* ignore */ }
    if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setBoot('on');
    const a = setTimeout(() => setBoot('out'), 1400), b = setTimeout(() => setBoot('off'), 1900);
    try { sessionStorage.setItem('boot', '1'); } catch { /* ignore */ }
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

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

  const openTarget = (t: OpenTarget) => {
    if ('project' in t) { setProject(t.project); open('player'); }
    else open(t.app as AppId);
  };
  const openProject = (pid: string) => { setProject(pid); open('player'); };

  const current = PROJECTS.find((p) => p.id === project) ?? PROJECTS[0];
  const content: Record<AppId, ReactNode> = {
    about: <About />,
    records: <Records onOpen={openProject} />,
    player: <Player project={current} />,
    terminal: <Terminal focused={focus === 'terminal'} onOpen={openTarget} onTheme={() => toggleTheme()} />,
    hire: <Hire />,
  };
  const dockItems: DockItem[] = ORDER.map((id) => ({ id, label: APPS[id].label, icon: ICONS[id], running: wins[id].status !== 'closed' }));

  return (
    <div className="desk" ref={desk}>
      <div className="grain" aria-hidden="true" />
      <NetBackground />

      <div className="menu">
        <span className="brand"><Penguin interactive={false} follow={false} className="menu-pm" />DecoudJuan</span>
        <span className="apps">
          {(['about', 'records', 'terminal', 'hire'] as AppId[]).map((id) => <button key={id} type="button" onClick={() => open(id)}>{APPS[id].label}</button>)}
        </span>
        <span className="r">
          <button type="button" aria-label="Cambiar tema" onClick={(e) => toggleTheme(e)}>&#9681;</button>
          <Clock />
        </span>
      </div>

      <div className="icons" aria-label="Escritorio">
        {(['about', 'records', 'terminal', 'hire'] as AppId[]).map((id) => (
          <button key={id} type="button" className="icon" onClick={() => open(id)}>
            <span className="ic">{ICONS[id]}</span><span className="lb">{APPS[id].label}</span>
          </button>
        ))}
      </div>

      <aside className="note" aria-label="Ahora">
        <b>Ahora</b>
        <ul>{NOW.map(([k, v]) => <li key={k}><strong>{k}</strong> {v}</li>)}</ul>
      </aside>

      {ORDER.map((id) => (
        <Window
          key={id}
          win={wins[id]}
          title={id === 'player' ? `reproductor · ${current.name}` : APPS[id].title}
          focused={focus === id}
          variant={APPS[id].variant}
          minW={APPS[id].minW}
          minH={APPS[id].minH}
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

      <Dock items={dockItems} links={LINKS} onApp={dockClick} />

      {boot !== 'off' && (
        <div className={'boot' + (boot === 'out' ? ' out' : '')} onClick={() => setBoot('off')} aria-hidden="true">
          <Penguin interactive={false} follow={false} className="boot-pm" />
          <b>DecoudJuan</b>
          <span className="pb"><i /></span>
        </div>
      )}
    </div>
  );
}
