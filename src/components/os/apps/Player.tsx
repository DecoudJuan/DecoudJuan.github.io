// Player for long demos: the video with its description underneath, and the list of every
// demo on the side. Nothing downloads until play (preload="none"); chapters, speed, and the
// position is remembered per project in this browser.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Project } from '../../../data/content';
import { useLang } from '../lang';
// The canvas demos are a big chunk of code that the first demo (a video) doesn't need.
const DemoAnim = lazy(() => import('./DemoAnim'));

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const store = {
  get: (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; } },
  set: (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* not remembered */ } },
};

export default function Player({ project, onPick }: { project: Project; onPick: (id: string) => void }) {
  const { lang, t, c } = useLang();
  const P = t.player;
  const vRef = useRef<HTMLVideoElement>(null);
  // The strip of demos: no scrollbar; the mouse wheel scrolls it sideways and arrows show
  // up only on the side where there is more to see.
  const strip = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ l: false, r: false });
  useEffect(() => {
    const ul = strip.current!;
    const check = () => setMore({ l: ul.scrollLeft > 4, r: ul.scrollLeft + ul.clientWidth < ul.scrollWidth - 4 });
    const wheel = (e: WheelEvent) => {
      if (ul.scrollWidth <= ul.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      ul.scrollLeft += e.deltaY;
    };
    check();
    ul.addEventListener('scroll', check, { passive: true });
    ul.addEventListener('wheel', wheel, { passive: false });
    const ro = new ResizeObserver(check);
    ro.observe(ul);
    return () => { ul.removeEventListener('scroll', check); ul.removeEventListener('wheel', wheel); ro.disconnect(); };
  }, []);
  const page = (dir: number) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: 'smooth' });
  const [rate, setRate] = useState(1);
  const [resume, setResume] = useState('');
  const key = 'pos-' + project.id;

  useEffect(() => { setResume(''); setRate(1); }, [project.id]);
  useEffect(() => { if (vRef.current) vRef.current.playbackRate = rate; }, [rate]);

  const onMeta = () => {
    const v = vRef.current!, pos = store.get(key);
    if (pos > 5 && pos < v.duration - 5) { v.currentTime = pos; setResume(`${P.resume} ${fmt(pos)}`); }
  };
  const last = useRef(0);
  const onTime = () => {
    const v = vRef.current!;
    if (Math.abs(v.currentTime - last.current) > 4) { last.current = v.currentTime; store.set(key, Math.floor(v.currentTime)); }
  };
  // Previous / next demo, wrapping around the list.
  const idx = c.PROJECTS.findIndex((p) => p.id === project.id), n = c.PROJECTS.length;
  const prev = c.PROJECTS[(idx - 1 + n) % n], next = c.PROJECTS[(idx + 1) % n];
  const seek = (t: number) => { const v = vRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };

  return (
    <div className="player" style={{ ['--c' as string]: project.color }}>
      <div className="screen-wrap">
        <div className="screen-row">
        <button type="button" className="nav-btn" aria-label={`${P.prev}: ${prev.name}`} title={prev.name} onClick={() => onPick(prev.id)}>&#8249;</button>
        <div className="screen" key={project.id}>
          {project.video ? (
            <video key={project.id} ref={vRef} controls playsInline preload="none" poster={project.poster} onLoadedMetadata={onMeta} onTimeUpdate={onTime}>
              <source src={project.video} type="video/mp4" />
            </video>
          ) : project.anim ? (
            <Suspense fallback={null}><DemoAnim key={project.anim} kind={project.anim} lang={lang} /></Suspense>
          ) : (
            <div className="ph-video">
              {project.soon && <span className="soon-tag">{P.soonTitle}</span>}
              <b>{project.name}</b>
              {project.soon ? <small>{P.soon}</small> : (() => {
                const live = project.links.find(([k]) => k === 'try');
                return live ? <a className="btn-l" href={live[1]} target="_blank" rel="noopener">{P.live} <span aria-hidden="true">&#8599;</span></a> : null;
              })()}
            </div>
          )}
        </div>
        <button type="button" className="nav-btn" aria-label={`${P.next}: ${next.name}`} title={next.name} onClick={() => onPick(next.id)}>&#8250;</button>
        </div>
      </div>
      <aside className="pl-side">
        <div className="pl-info" key={project.id}>
          <div className="pl-h">
            <h2>{project.name}</h2><span>{project.kind}</span>
            {project.video && (
              <span className="pl-ctl" role="group" aria-label={P.speed}>
                {[1, 1.5, 2].map((r) => (
                  <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)}>{String(r).replace('.', ',')}x</button>
                ))}
                {resume && <span>{resume}</span>}
              </span>
            )}
          </div>
          <p className="pl-t">{project.text}</p>
          {project.links.length > 0 && (
            <div className="pl-links">{project.links.map(([k, u]) => <a key={u} href={u} target="_blank" rel="noopener">{t.link[k]} <span aria-hidden="true">&#8599;</span></a>)}</div>
          )}
          {project.video && project.chapters?.length ? (
            <ul className="chap" aria-label={P.chapters}>
              {project.chapters.map(([at, l]) => <li key={at}><button type="button" onClick={() => seek(at)}><span>{fmt(at)}</span>{l}</button></li>)}
            </ul>
          ) : null}
        </div>
        <nav className="pl-list" aria-label={P.all}>
        <p className="chap-h">{P.list}</p>
        <div className="strip">
        {more.l && <button type="button" className="strip-btn l" aria-label={P.left} onClick={() => page(-1)}>&#8249;</button>}
        <ul ref={strip}>
          {c.PROJECTS.map((p) => (
            <li key={p.id}>
              <button type="button" aria-current={p.id === project.id} onClick={() => onPick(p.id)} style={{ ['--c' as string]: p.color }}>
                <span className="thumb" aria-hidden="true" style={p.poster ? { backgroundImage: `url(${p.poster})` } : undefined} />
                <span className="pl-it"><b>{p.name}</b><small>{p.kind}</small></span>
              </button>
            </li>
          ))}
        </ul>
        {more.r && <button type="button" className="strip-btn r" aria-label={P.right} onClick={() => page(1)}>&#8250;</button>}
        </div>
        </nav>
      </aside>
    </div>
  );
}
