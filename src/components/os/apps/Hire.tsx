// Short pitch plus a live-looking preview of the freelance site; everything leads there.
import { useRef, useState } from 'react';
import { HIRE, PERSON } from '../../../data/content';

export default function Hire() {
  const [copied, setCopied] = useState(false);
  const btn = useRef<HTMLAnchorElement>(null);

  const copy = () => {
    navigator.clipboard?.writeText(PERSON.email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => {});
  };
  // The main button leans toward the pointer (mouse only).
  const mag = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = btn.current!, r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const host = HIRE.site.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="hire">
      <div className="hire-tx">
        <h2>{HIRE.title}</h2>
        <p>{HIRE.text}</p>
        <ul className="hire-tags">{HIRE.services.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="row">
          <a ref={btn} className="btn-l" href={HIRE.site} target="_blank" rel="noopener" onPointerMove={mag} onPointerLeave={() => { btn.current!.style.transform = ''; }}>
            Ver mis servicios <span aria-hidden="true">&#8599;</span>
          </a>
          <button type="button" className="btn-o" onClick={copy}>{copied ? 'Mail copiado' : 'Copiar mail'}</button>
        </div>
      </div>
      <a className="browser" href={HIRE.site} target="_blank" rel="noopener" aria-label={`Abrir ${host}`}>
        <span className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{host}</span></span>
        <img src="/previews/servicios.webp" alt={`Página de servicios freelance en ${host}`} width="1200" height="750" loading="lazy" />
      </a>
    </div>
  );
}
