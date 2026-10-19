// Spotlight-style search (Ctrl/Cmd + K): apps, projects, notes and actions in one list.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

export type SpotItem = { id: string; kind: string; label: string; sub?: string; run: () => void };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Spotlight({ items, placeholder, empty, results, onClose }: { items: SpotItem[]; placeholder: string; empty: string; results: string; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const n = norm(q.trim());
    return (n ? items.filter((x) => norm(`${x.label} ${x.sub ?? ''} ${x.kind}`).includes(n)) : items).slice(0, 9);
  }, [q, items]);

  // A real modal: everything behind it is inert (no Tab, no clicks, hidden from screen readers)
  // while it is open. Focus goes to the input and back to whatever had it on close; a window
  // opened from a result then takes it. A layout effect, so its cleanup lifts the inert before
  // that window tries to take focus.
  useLayoutEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const behind = [...(wrap.current!.parentElement?.children ?? [])].filter((el) => el !== wrap.current && !el.hasAttribute('inert'));
    behind.forEach((el) => el.setAttribute('inert', ''));
    input.current?.focus();
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      before?.focus?.();
    };
  }, []);
  useEffect(() => { setI(0); }, [q]);
  // Escape closes it wherever focus is inside the dialog.
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [onClose]);

  const go = (x?: SpotItem) => { if (!x) return; onClose(); x.run(); };

  return (
    <div className="spot-wrap" ref={wrap} onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Clicks inside never take focus away from the input. */}
      <div className="spot" role="dialog" aria-modal="true" aria-label={placeholder} onPointerDown={(e) => { if (e.target !== input.current) e.preventDefault(); }}>
        <div className="spot-in">
          <MagnifyingGlass weight="bold" aria-hidden="true" />
          <input
            ref={input} value={q} placeholder={placeholder} aria-label={placeholder} autoComplete="off" spellCheck={false}
            role="combobox" aria-autocomplete="list" aria-expanded={list.length > 0} aria-controls="spot-list" aria-activedescendant={list[i] ? `spot-${list[i].id}` : undefined}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setI((i + 1) % Math.max(1, list.length)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setI((i - 1 + list.length) % Math.max(1, list.length)); }
              else if (e.key === 'Enter') { e.preventDefault(); go(list[i]); }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <p className="sr-only" role="status">{list.length ? `${list.length} ${results}` : empty}</p>
        {list.length === 0 && <p className="spot-empty">{empty}</p>}
        <ul id="spot-list" role="listbox" aria-label={placeholder}>
          {list.map((x, k) => (
            <li key={x.id} id={`spot-${x.id}`} role="option" aria-selected={k === i} onPointerEnter={() => setI(k)} onClick={() => go(x)}>
              <span className="spot-k">{x.kind}</span><b>{x.label}</b>{x.sub && <small>{x.sub}</small>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
