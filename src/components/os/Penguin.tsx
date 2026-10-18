// The penguin bust from Claude-pet (avatars/penguin/draw.js, MIT, same author), ported to React.
// It follows the cursor, blinks and squashes when poked. The torso geometry is PetBody's.
import { useEffect, useId, useRef } from 'react';

const TORSO = 'M0.3 262 C-1.6 198 44 162 120 162 C196 162 241.6 198 239.7 262 Z';
const BELLY = 'M64.9 262 C63 214 93.4 196 120 196 C146.6 196 177 214 175.1 262 Z';

/** `still`: a static drawing (no blink, no cursor, no poke), for icons. */
type Props = { interactive?: boolean; follow?: boolean; still?: boolean; className?: string; label?: string };

export default function Penguin({ interactive = true, follow = true, still = false, className = '', label }: Props) {
  if (still) { interactive = false; follow = false; }
  const svgRef = useRef<SVGSVGElement>(null);
  const clip = 'pm-crop-' + useId().replace(/:/g, '');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || still) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = svg.querySelector<SVGGElement>('.pm-head')!;
    const body = svg.querySelector<SVGGElement>('.pm-body')!;
    const pupils = svg.querySelectorAll<SVGGElement>('.pm-pupil');
    let tx = 0, ty = 0, sx = 0, sy = 0, lastMove = -Infinity, cx: number | null = null, cy = 0, raf = 0, last = 0;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const q = (v: number) => (Math.round(v * 2) / 2).toFixed(1);

    const aim = () => {
      if (cx === null) return;
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      tx = clamp((cx - (r.left + r.width / 2)) / (r.width * 1.4));
      ty = clamp((cy - (r.top + r.height * 0.44)) / (r.height * 1.1));
    };
    const onMove = (e: PointerEvent) => { cx = e.clientX; cy = e.clientY; lastMove = performance.now(); aim(); };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      if (now - lastMove > 2600) { tx = Math.sin(now / 2400) * 0.45; ty = Math.sin(now / 3700) * 0.28 - 0.05; }
      sx += (tx - sx) * 0.14; sy += (ty - sy) * 0.14;
      head.setAttribute('transform', `translate(${q(sx * 8)} ${q(sy * 6)}) rotate(${q(sx * 5)} 120 180)`);
      body.setAttribute('transform', `translate(${q(sx * 3)} ${q(sy * 2)})`);
      pupils.forEach((p) => p.setAttribute('transform', `translate(${q(sx * 6)} ${q(sy * 5)})`));
    };

    let blinkT = 0, openT = 0, pokeT = 0;
    const blink = (n: number) => {
      svg.classList.add('is-blinking');
      openT = window.setTimeout(() => {
        svg.classList.remove('is-blinking');
        if (n > 1) window.setTimeout(() => blink(n - 1), 110);
      }, 130);
    };
    const schedule = () => {
      blinkT = window.setTimeout(() => { if (!document.hidden) blink(Math.random() < 0.22 ? 2 : 1); schedule(); }, 2200 + Math.random() * 4200);
    };
    const poke = () => {
      blink(2);
      if (reduced) return;
      svg.classList.remove('is-poked');
      void svg.getBoundingClientRect();
      svg.classList.add('is-poked');
      clearTimeout(pokeT);
      pokeT = window.setTimeout(() => svg.classList.remove('is-poked'), 980);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); } };

    schedule();
    if (follow && !reduced) { addEventListener('pointermove', onMove, { passive: true }); raf = requestAnimationFrame(frame); }
    if (interactive) { svg.addEventListener('pointerdown', poke); svg.addEventListener('keydown', onKey); }
    return () => {
      cancelAnimationFrame(raf); clearTimeout(blinkT); clearTimeout(openT); clearTimeout(pokeT);
      removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerdown', poke); svg.removeEventListener('keydown', onKey);
    };
  }, [interactive, follow, still]);

  return (
    <svg
      ref={svgRef}
      className={'pm ' + className}
      viewBox="0 0 240 240"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      tabIndex={interactive ? 0 : undefined}
    >
      <defs><clipPath id={clip}><rect x="-120" y="-120" width="480" height="360" /></clipPath></defs>
      <g className="pm-all">
        <g className="pm-body" clipPath={`url(#${clip})`}>
          <path className="pm-fill-ink" d={TORSO} />
          <path className="pm-fill-snow" d={BELLY} />
          <path className="pm-feather" d="M140 212 C143.8 216 143.8 221 140.9 225" />
          <path className="pm-feather" d="M148.5 224 C152.3 228 152.3 233 149.4 237" />
        </g>
        <g className="pm-head" transform="translate(120 0) scale(0.95 1) translate(-120 0)">
          <path className="pm-fill-ink" d="M120 30 C66 30 28 64 28 116 C28 158 62 186 120 186 C178 186 212 158 212 116 C212 64 174 30 120 30 Z" />
          <path className="pm-fill-snow" d="M31 124 C31 86 50 70 76 70 C100 70 112 88 114 108 C116 115 124 115 126 108 C128 88 140 70 164 70 C190 70 209 86 209 124 C209 162 172 184 120 184 C68 184 31 162 31 124 Z" />
          {[76, 164].map((x) => (
            <g className="pm-eye" key={x}>
              <ellipse className="pm-fill-snow" cx={x} cy="107" rx="18" ry="17" />
              <g className="pm-pupil">
                <ellipse className="pm-fill-ink" cx={x} cy="107" rx="11" ry="13" />
                <ellipse className="pm-fill-snow" cx={x - 4.8} cy="101" rx="3.6" ry="5" transform={`rotate(-24 ${x - 4.8} 101)`} />
              </g>
            </g>
          ))}
          <path className="pm-beak" d="M99 120 C101 111 110 107 120 107 C130 107 139 111 141 120 C141 132 132 150 120 157 C108 150 99 132 99 120 Z" />
          <path className="pm-beak-shade" d="M120 109 C129 109 137 113 139 120 C139 131 131 148 120 155 Z" />
          <g className="pm-frame"><path d="M28 84 L13 95" /><path d="M212 84 L227 95" /></g>
          <path className="pm-band-out" d="M30 106 C30 -10 210 -10 210 106" />
          <path className="pm-band" d="M30 106 C30 -10 210 -10 210 106" />
          <path className="pm-band-line" d="M38 106 C38 4 202 4 202 106" />
          <rect className="pm-cup" x="13" y="84" width="37" height="68" rx="18" />
          <rect className="pm-cup-line" x="21" y="93" width="21" height="50" rx="10" />
          <rect className="pm-cup" x="190" y="84" width="37" height="68" rx="18" />
          <rect className="pm-cup-line" x="198" y="93" width="21" height="50" rx="10" />
          <g className="pm-frame">
            <path d="M26 88 C26 78 32 74 48 74 L100 74 C110 74 114 80 114 91 C114 106 112 120 108 127 C104 134 92 137 72 137 C50 137 36 134 31 126 C27 119 26 97 26 88 Z" />
            <path d="M214 88 C214 78 208 74 192 74 L140 74 C130 74 126 80 126 91 C126 106 128 120 132 127 C136 134 148 137 168 137 C190 137 204 134 209 126 C213 119 214 97 214 88 Z" />
            <path d="M114 85 C117 81 123 81 126 85" />
          </g>
        </g>
        <g aria-hidden="true">
          <text className="pm-note" x="16" y="70">&#9834;</text>
          <text className="pm-note pm-note-b" x="206" y="78" style={{ ['--pm-nx' as string]: '12px' }}>&#9835;</text>
        </g>
      </g>
    </svg>
  );
}
