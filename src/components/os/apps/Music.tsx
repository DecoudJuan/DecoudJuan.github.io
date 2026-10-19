// "What plays while I code": Juan's Spotify playlists, one embed at a time with tabs to switch.
import { useState } from 'react';
import Penguin from '../Penguin';
import { PLAYLISTS } from '../../../data/content';
import { useLang } from '../lang';

export default function Music() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const [, id] = PLAYLISTS[i];
  return (
    <div className="music">
      <div className="music-head">
        <span className="music-pm"><Penguin interactive={false} follow={false} label={t.aboutPenguin} /></span>
        <div>
          <h2>{t.music.title}</h2>
          <div className="eq" aria-hidden="true">{Array.from({ length: 14 }, (_, k) => <i key={k} style={{ ['--d' as string]: `${(k * 137) % 900}ms` }} />)}</div>
        </div>
      </div>
      <div className="music-tabs" role="group" aria-label={t.music.title}>
        {PLAYLISTS.map(([label], k) => (
          <button key={label} type="button" aria-pressed={k === i} onClick={() => setI(k)}>{label}</button>
        ))}
      </div>
      <iframe
        key={id} className="music-embed" title={PLAYLISTS[i][0]} loading="lazy"
        src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}
