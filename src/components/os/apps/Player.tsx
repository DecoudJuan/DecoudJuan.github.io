// Player for long demos: the video with its description underneath, and the list of every
// demo on the side. Nothing downloads until play (preload="none"); chapters, speed, and the
// position is remembered per project in this browser.
import { useEffect, useRef, useState } from 'react';
import { PROJECTS, type Project } from '../../../data/content';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const store = {
  get: (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; } },
  set: (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* not remembered */ } },
};

export default function Player({ project, onPick }: { project: Project; onPick: (id: string) => void }) {
  const vRef = useRef<HTMLVideoElement>(null);
  const [rate, setRate] = useState(1);
  const [resume, setResume] = useState('');
  const key = 'pos-' + project.id;

  useEffect(() => { setResume(''); setRate(1); }, [project.id]);
  useEffect(() => { if (vRef.current) vRef.current.playbackRate = rate; }, [rate]);

  const onMeta = () => {
    const v = vRef.current!, t = store.get(key);
    if (t > 5 && t < v.duration - 5) { v.currentTime = t; setResume(`seguís en ${fmt(t)}`); }
  };
  const last = useRef(0);
  const onTime = () => {
    const v = vRef.current!;
    if (Math.abs(v.currentTime - last.current) > 4) { last.current = v.currentTime; store.set(key, Math.floor(v.currentTime)); }
  };
  const seek = (t: number) => { const v = vRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };

  return (
    <div className="player" style={{ ['--c' as string]: project.color }}>
      <div className="pl-main" key={project.id}>
        <div className="screen">
          {project.video ? (
            <video key={project.id} ref={vRef} controls playsInline preload="none" poster={project.poster} onLoadedMetadata={onMeta} onTimeUpdate={onTime}>
              <source src={project.video} type="video/mp4" />
            </video>
          ) : (
            <div className="ph-video">
              <span className="play" aria-hidden="true" />
              <b>Demo de {project.name}</b>
              <small>Acá va el video. Carga recién cuando le das play.</small>
            </div>
          )}
        </div>
        <div className="pl-info">
          <div className="pl-h">
            <h2>{project.name}</h2><span>{project.kind}</span>
            {project.video && (
              <span className="pl-ctl" role="group" aria-label="Velocidad">
                {[1, 1.5, 2].map((r) => (
                  <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)}>{String(r).replace('.', ',')}x</button>
                ))}
                {resume && <span>{resume}</span>}
              </span>
            )}
          </div>
          <p className="pl-t">{project.text}</p>
          {project.links.length > 0 && (
            <div className="pl-links">{project.links.map(([l, u]) => <a key={u} href={u} target="_blank" rel="noopener">{l} <span aria-hidden="true">&#8599;</span></a>)}</div>
          )}
          {project.video && project.chapters?.length ? (
            <ul className="chap" aria-label="Capítulos">
              {project.chapters.map(([t, l]) => <li key={t}><button type="button" onClick={() => seek(t)}><span>{fmt(t)}</span>{l}</button></li>)}
            </ul>
          ) : null}
        </div>
      </div>
      <nav className="pl-list" aria-label="Todas las demos">
        <p className="chap-h">Demos</p>
        <ul>
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <button type="button" aria-current={p.id === project.id} onClick={() => onPick(p.id)} style={{ ['--c' as string]: p.color }}>
                <span className="thumb" aria-hidden="true" />
                <span className="pl-it"><b>{p.name}</b><small>{p.kind}</small></span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
