// One desktop window: title bar with the three lights, 8 resize handles, drag, and the
// open / minimize (genie) / restore / close animations. Geometry lives in Desktop.
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Anim, Rect, WinState } from './types';

type Props = {
  win: WinState;
  title: string;
  focused: boolean;
  variant?: 'dark' | 'inv';
  minW: number;
  minH: number;
  bounds: () => { w: number; top: number; bottom: number };
  onFocus: () => void;
  onRect: (r: Rect) => void;
  onRequest: (a: Anim) => void;
  onToggleMax: () => void;
  onAnimEnd: (a: Anim) => void;
  children: ReactNode;
};

const DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => matchMedia('(max-width: 760px)').matches;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** macOS-style genie: the bottom edge narrows onto the dock icon, then the window pours into it. */
function genieFrames(el: HTMLElement, id: string): Keyframe[] | null {
  const icon = document.querySelector(`[data-dock="${id}"]`);
  if (!icon) return null;
  const w = el.getBoundingClientRect(), i = icon.getBoundingClientRect();
  const L = clamp(((i.left - w.left) / w.width) * 100, -40, 140);
  const R = clamp(((i.right - w.left) / w.width) * 100, -40, 140);
  const dy = i.top + i.height / 2 - w.bottom;
  return [
    { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', transform: 'none', opacity: 1, offset: 0 },
    { clipPath: `polygon(0% 0%, 100% 0%, ${R}% 100%, ${L}% 100%)`, transform: 'none', opacity: 1, offset: 0.42 },
    { clipPath: `polygon(${L}% 0%, ${R}% 0%, ${R}% 100%, ${L}% 100%)`, transform: `translateY(${dy}px) scaleY(0.04)`, opacity: 0.5, offset: 1 },
  ];
}

export default function Window(p: Props) {
  const ref = useRef<HTMLElement>(null);
  const { win } = p;

  // Run the requested animation, then report back so Desktop can commit the state.
  useLayoutEffect(() => {
    const el = ref.current;
    const a = win.anim;
    if (!el || !a) return;
    const done = () => p.onAnimEnd(a);
    if (reduced() || narrow() || !el.animate) { done(); return; }
    let anim: Animation | null = null;
    const genie = genieFrames(el, win.id);
    if (a === 'minimizing' && genie) anim = el.animate(genie, { duration: 520, easing: 'cubic-bezier(.55,0,.35,1)' });
    else if (a === 'restoring' && genie) anim = el.animate([...genie].reverse().map((k) => ({ ...k, offset: 1 - (k.offset as number) })), { duration: 520, easing: 'cubic-bezier(.55,0,.35,1)' });
    else if (a === 'closing') anim = el.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }], { duration: 170, easing: 'ease-in' });
    else if (a === 'opening') anim = el.animate([{ transform: 'scale(.92)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    if (!anim) { done(); return; }
    anim.onfinish = done;
    return () => { anim && (anim.onfinish = null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.anim]);

  const drag = (e: React.PointerEvent) => {
    if (narrow() || e.button > 0 || (e.target as HTMLElement).closest('button')) return;
    const b = p.bounds(), sx = e.clientX, sy = e.clientY;
    let o = win.rect;
    if (win.max && win.prev) {
      // Dragging a maximized window restores it under the pointer, like a real OS.
      const desk = ref.current!.parentElement!.getBoundingClientRect();
      const rel = (e.clientX - desk.left) / b.w;
      o = { ...win.prev, x: e.clientX - desk.left - win.prev.w * rel, y: b.top };
      p.onToggleMax();
    }
    const t = e.currentTarget as HTMLElement;
    t.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => p.onRect({ ...o, x: clamp(o.x + ev.clientX - sx, -o.w + 120, b.w - 120), y: clamp(o.y + ev.clientY - sy, b.top, b.bottom - 36) });
    const up = () => { t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up); t.removeEventListener('pointercancel', up); };
    t.addEventListener('pointermove', move); t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  };

  const resize = (d: string) => (e: React.PointerEvent) => {
    if (narrow() || win.max) return;
    e.stopPropagation();
    p.onFocus();
    const b = p.bounds(), sx = e.clientX, sy = e.clientY, o = win.rect;
    const t = e.currentTarget as HTMLElement;
    t.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy, r = { ...o };
      if (d.includes('e')) r.w = clamp(o.w + dx, p.minW, b.w - o.x);
      if (d.includes('s')) r.h = clamp(o.h + dy, p.minH, b.bottom - o.y);
      if (d.includes('w')) { r.w = clamp(o.w - dx, p.minW, o.x + o.w); r.x = o.x + o.w - r.w; }
      if (d.includes('n')) { r.h = clamp(o.h - dy, p.minH, o.y + o.h - b.top); r.y = o.y + o.h - r.h; }
      p.onRect(r);
    };
    const up = () => { t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up); t.removeEventListener('pointercancel', up); };
    t.addEventListener('pointermove', move); t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  };

  const r = win.rect;
  const cls = ['win', p.focused && 'focus', win.max && 'max', p.variant, win.maxAnim && 'anim', r.w >= 760 && 'wide'].filter(Boolean).join(' ');
  return (
    <section
      ref={ref}
      className={cls}
      aria-label={p.title}
      hidden={win.status !== 'open'}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, zIndex: win.z }}
      onPointerDown={p.onFocus}
    >
      <header className="wt" onPointerDown={drag} onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest('button')) p.onToggleMax(); }}>
        <span className="lights">
          <button type="button" className="c" aria-label={`Cerrar ${p.title}`} onClick={() => p.onRequest('closing')}>&times;</button>
          <button type="button" className="m" aria-label={`Minimizar ${p.title}`} onClick={() => p.onRequest('minimizing')}>&minus;</button>
          <button type="button" className="x" aria-label={`${win.max ? 'Restaurar' : 'Maximizar'} ${p.title}`} onClick={p.onToggleMax}>+</button>
        </span>
        <span className="ttl">{p.title}</span>
      </header>
      <div className="wb">{p.children}</div>
      {DIRS.map((d) => <div key={d} className="rz" data-d={d} aria-hidden="true" onPointerDown={resize(d)} />)}
    </section>
  );
}
