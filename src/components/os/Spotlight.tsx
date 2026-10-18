// Spotlight-style search (Ctrl/Cmd + K): apps, projects, notes and actions in one list.
import { useEffect, useMemo, useRef, useState } from 'react';

export type SpotItem = { id: string; kind: string; label: string; sub?: string; run: () => void };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Spotlight({ items, placeholder, empty, onClose }: { items: SpotItem[]; placeholder: string; empty: string; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => {
    const n = norm(q.trim());
    return (n ? items.filter((x) => norm(`${x.label} ${x.sub ?? ''} ${x.kind}`).includes(n)) : items).slice(0, 9);
  }, [q, items]);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setI(0); }, [q]);

  const go = (x?: SpotItem) => { if (!x) return; onClose(); x.run(); };

  return (
    <div className="spot-wrap" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spot" role="dialog" aria-modal="true" aria-label={placeholder}>
        <div className="spot-in">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <input
            ref={input} value={q} placeholder={placeholder} aria-label={placeholder} autoComplete="off" spellCheck={false}
            role="combobox" aria-expanded="true" aria-controls="spot-list" aria-activedescendant={list[i] ? `spot-${list[i].id}` : undefined}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); onClose(); }
              else if (e.key === 'ArrowDown') { e.preventDefault(); setI((i + 1) % Math.max(1, list.length)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setI((i - 1 + list.length) % Math.max(1, list.length)); }
              else if (e.key === 'Enter') { e.preventDefault(); go(list[i]); }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <ul id="spot-list" role="listbox">
          {list.length === 0 && <li className="spot-empty">{empty}</li>}
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
