// Player for long demos: nothing downloads until play (preload="none"), chapters to jump,
// playback speed, and the position is remembered per project in this browser.
import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../../data/content';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const store = {
  get: (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; } },
  set: (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* not remembered */ } },
};

export default function Player({ project }: { project: Project }) {
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
      <div className="screen">
        {project.video ? (
          <video key={project.id} ref={vRef} controls playsInline preload="none" poster={project.poster} onLoadedMetadata={onMeta} onTimeUpdate={onTime}>
            <source src={project.video} type="video/mp4" />
          </video>
        ) : (
          <div className="ph-video">
            <span className="play" aria-hidden="true" />
            <b>Demo de {project.name}</b>
            <small>Acá va el video. Carga recién cuando le das play, con portada, capítulos y velocidad.</small>
          </div>
        )}
      </div>
      <div className="pl-side">
        <div className="pl-h"><h2>{project.name}</h2><span>{project.kind}</span></div>
        {project.video && (
          <div className="pl-ctl" role="group" aria-label="Velocidad">
            {[1, 1.5, 2].map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => setRate(r)}>{String(r).replace('.', ',')}x</button>
            ))}
            {resume && <span>{resume}</span>}
          </div>
        )}
        <p className="pl-t">{project.text}</p>
        {project.video && project.chapters?.length ? (
          <div>
            <p className="chap-h">Capítulos</p>
            <ul className="chap">
              {project.chapters.map(([t, l]) => <li key={t}><button type="button" onClick={() => seek(t)}><span>{fmt(t)}</span>{l}</button></li>)}
            </ul>
          </div>
        ) : null}
        {project.links.length > 0 && (
          <div className="pl-links">{project.links.map(([l, u]) => <a key={u} href={u} target="_blank" rel="noopener">{l} <span aria-hidden="true">&#8599;</span></a>)}</div>
        )}
      </div>
    </div>
  );
}
