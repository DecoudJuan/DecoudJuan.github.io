// One desktop window: title bar with the three lights, 8 resize handles, drag, and the
// open / minimize (genie) / restore / close animations. Geometry lives in Desktop.
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Anim, Rect, WinState } from './types';
import { Minus, Plus, X } from '@phosphor-icons/react/dist/ssr';
import { useLang } from './lang';
import { motionOff } from './motion';

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
const narrow = () => matchMedia('(max-width: 760px)').matches;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const STEP: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

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
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  /** The last hide animation. It keeps its end frame (fill: forwards) so the window doesn't
   *  flash back for a frame before React hides it; it is cancelled when the window comes back. */
  const held = useRef<Animation | null>(null);
  const { win } = p;
  /** Focus: whatever opened the window gets it back when the window closes or minimizes, if focus
   *  was inside the window at that moment (otherwise the user is already somewhere else). */
  const opener = useRef<HTMLElement | null>(null);
  const giveBack = useRef(false);
  const wasOpen = useRef(win.status === 'open');
  // Layout effect, so it runs before the apps' own effects (the terminal focuses its prompt).
  useLayoutEffect(() => {
    const el = ref.current!, open = win.status === 'open';
    if (open && !wasOpen.current) {
      const a = document.activeElement as HTMLElement | null;
      opener.current = a && a !== document.body ? a : null;
      el.focus({ preventScroll: true });
    } else if (!open && wasOpen.current && giveBack.current) {
      const o = opener.current;
      (o?.isConnected && o.offsetParent ? o : document.querySelector<HTMLElement>(`[data-dock="${win.id}"]`))?.focus({ preventScroll: true });
    }
    if (!open) giveBack.current = false;
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.status]);

  // Run the requested animation, then report back so Desktop can commit the state.
  useLayoutEffect(() => {
    const el = ref.current;
    const a = win.anim;
    if (!el || !a) return;
    const done = () => p.onAnimEnd(a);
    // Read here, while the window still shows: the effect above acts on it once the status changes.
    if (a === 'closing' || a === 'minimizing') giveBack.current = el.contains(document.activeElement);
    if (a === 'restoring' || a === 'opening') { held.current?.cancel(); held.current = null; }
    if (motionOff() || narrow() || !el.animate) { done(); return; }
    let anim: Animation | null = null;
    const genie = genieFrames(el, win.id);
    const hide = { fill: 'forwards' as const };
    if (a === 'minimizing' && genie) anim = el.animate(genie, { duration: 520, easing: 'cubic-bezier(.55,0,.35,1)', ...hide });
    else if (a === 'restoring' && genie) anim = el.animate([...genie].reverse().map((k) => ({ ...k, offset: 1 - (k.offset as number) })), { duration: 520, easing: 'cubic-bezier(.55,0,.35,1)' });
    else if (a === 'closing') anim = el.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }], { duration: 170, easing: 'ease-in', ...hide });
    else if (a === 'opening') anim = el.animate([{ transform: 'scale(.92)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    if (!anim) { done(); return; }
    if (a === 'minimizing' || a === 'closing') held.current = anim;
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

  /** Keyboard alternative to dragging: Alt + arrows move the window, Alt + Shift + arrows resize it. */
  const keys = (e: React.KeyboardEvent) => {
    const d = STEP[e.key];
    // Not with Ctrl or Cmd (screen readers, workspaces, AltGr), and not inside a text field,
    // where Option + arrows move the caret by word on a Mac.
    if (!e.altKey || e.ctrlKey || e.metaKey || !d || (e.target as HTMLElement).matches('input, textarea, [contenteditable]')) return;
    e.preventDefault();
    if (narrow() || win.max) return;
    const b = p.bounds(), o = win.rect, dx = d[0] * 24, dy = d[1] * 24;
    p.onRect(e.shiftKey
      ? { ...o, w: clamp(o.w + dx, p.minW, b.w - o.x), h: clamp(o.h + dy, p.minH, b.bottom - o.y) }
      : { ...o, x: clamp(o.x + dx, -o.w + 120, b.w - 120), y: clamp(o.y + dy, b.top, b.bottom - 36) });
  };

  const r = win.rect;
  const cls = ['win', p.focused && 'focus', win.max && 'max', p.variant, win.maxAnim && 'anim', r.w >= 760 && 'wide'].filter(Boolean).join(' ');
  return (
    <section
      ref={ref}
      className={cls}
      data-app={win.id}
      tabIndex={-1}
      aria-label={p.title}
      aria-describedby="win-keys"
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight Alt+Shift+ArrowUp Alt+Shift+ArrowDown Alt+Shift+ArrowLeft Alt+Shift+ArrowRight"
      hidden={win.status !== 'open'}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, zIndex: win.z }}
      onPointerDown={p.onFocus}
      onFocusCapture={p.onFocus}
      onKeyDown={keys}
    >
      <header className="wt" onPointerDown={drag} onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest('button')) p.onToggleMax(); }}>
        <span className="lights">
          <button type="button" className="c" aria-label={`${t.win.close} ${p.title}`} onClick={() => p.onRequest('closing')}><X weight="bold" aria-hidden="true" /></button>
          <button type="button" className="m" aria-label={`${t.win.min} ${p.title}`} onClick={() => p.onRequest('minimizing')}><Minus weight="bold" aria-hidden="true" /></button>
          <button type="button" className="x" aria-label={`${win.max ? t.win.restore : t.win.max} ${p.title}`} onClick={p.onToggleMax}><Plus weight="bold" aria-hidden="true" /></button>
        </span>
        <span className="ttl">{p.title}</span>
      </header>
      <div className="wb">{p.children}</div>
      {DIRS.map((d) => <div key={d} className="rz" data-d={d} aria-hidden="true" onPointerDown={resize(d)} />)}
    </section>
  );
}
