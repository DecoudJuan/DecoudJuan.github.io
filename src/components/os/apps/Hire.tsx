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

  return (
    <div className="hire">
      <h2>{HIRE.title}</h2>
      <p>{HIRE.text}</p>
      <ul>{HIRE.items.map((i) => <li key={i}>{i}</li>)}</ul>
      <div className="row">
        <a ref={btn} className="btn-l" href={`mailto:${PERSON.email}`} onPointerMove={mag} onPointerLeave={() => { btn.current!.style.transform = ''; }}>Escribime</a>
        <button type="button" className="btn-o" onClick={copy}>{copied ? 'Copiado' : PERSON.email}</button>
        <a className="btn-o" href={PERSON.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
  );
}
