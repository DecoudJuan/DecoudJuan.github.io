// The dock. Its background never changes size: hovered icons grow with `scale` and their
// neighbours slide sideways (translateX) by exactly the extra width, so nothing overlaps.
import { useRef, type ReactNode } from 'react';
import type { AppId } from './types';

export type DockItem = { id: AppId; label: string; icon: ReactNode; running: boolean };
type Props = { items: DockItem[]; links: { label: string; href: string; icon: ReactNode }[]; onApp: (id: AppId) => void };

const BASE = 48, MAX = 1.55, GAP = 6, REACH = 140;

export default function Dock({ items, links, onApp }: Props) {
  const ref = useRef<HTMLElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dock = ref.current!, els = [...dock.querySelectorAll<HTMLElement>('.dk')];
    const px = e.clientX - dock.getBoundingClientRect().left;
    // Layout centres (offsetLeft ignores transforms, so these stay stable while we animate).
    const c = els.map((el) => el.offsetLeft + el.offsetWidth / 2);
    const s = c.map((x) => 1 + (MAX - 1) * Math.pow(Math.max(0, 1 - Math.abs(px - x) / REACH), 1.6));
    // Anchor the icon closest to the pointer and re-lay the others outward from it.
    let k = 0;
    c.forEach((x, i) => { if (Math.abs(px - x) < Math.abs(px - c[k])) k = i; });
    const nc = [...c];
    for (let i = k + 1; i < c.length; i++) nc[i] = nc[i - 1] + (BASE * s[i - 1]) / 2 + GAP + (BASE * s[i]) / 2 + (c[i] - c[i - 1] - BASE - GAP);
    for (let i = k - 1; i >= 0; i--) nc[i] = nc[i + 1] - (BASE * s[i + 1]) / 2 - GAP - (BASE * s[i]) / 2 - (c[i + 1] - c[i] - BASE - GAP);
    els.forEach((el, i) => { el.style.transform = `translateX(${(nc[i] - c[i]).toFixed(1)}px) scale(${s[i].toFixed(3)})`; });
  };
  const leave = () => ref.current?.querySelectorAll<HTMLElement>('.dk').forEach((el) => { el.style.transform = ''; });

  return (
    <nav className="dock" aria-label="Dock" ref={ref} onPointerMove={move} onPointerLeave={leave}>
      {items.map((it) => (
        <button key={it.id} type="button" className={'dk' + (it.running ? ' run' : '')} data-dock={it.id} onClick={() => onApp(it.id)} aria-label={it.label}>
          {it.icon}<span className="tip" aria-hidden="true">{it.label}</span>
        </button>
      ))}
      <span className="dsep" aria-hidden="true" />
      {links.map((l) => (
        <a key={l.href} className="dk" href={l.href} target="_blank" rel="noopener" aria-label={l.label}>
          {l.icon}<span className="tip" aria-hidden="true">{l.label}</span>
        </a>
      ))}
    </nav>
  );
}
