// "What plays while I code": Juan's Spotify playlists, one embed at a time with tabs to switch.
// The Spotify player is heavy and third-party: it loads only after a tap on "Play".
import { useState } from 'react';
import Penguin from '../Penguin';
import { PLAYLISTS } from '../../../data/content';
import { useLang } from '../lang';

export default function Music() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);
  const [, id] = PLAYLISTS[i];
  return (
    <div className="music">
      <div className="music-head">
        <span className="music-pm"><Penguin interactive={false} follow={false} label={t.aboutPenguin} /></span>
        <div>
          <h2>{t.music.title}</h2>
          <div className={'eq' + (on ? ' on' : '')} aria-hidden="true">{Array.from({ length: 14 }, (_, k) => <i key={k} style={{ ['--d' as string]: `${(k * 137) % 900}ms` }} />)}</div>
        </div>
      </div>
      <div className="music-tabs" role="group" aria-label={t.music.title}>
        {PLAYLISTS.map(([label], k) => (
          <button key={label} type="button" aria-pressed={k === i} onClick={() => setI(k)}>{label}</button>
        ))}
      </div>
      {on ? (
        <iframe
          key={id} className="music-embed" title={PLAYLISTS[i][0]}
          src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <div className="music-embed music-facade">
          <button type="button" className="btn-l" onClick={() => setOn(true)}>{t.music.play} {PLAYLISTS[i][0]}</button>
          <small>{t.music.note}</small>
        </div>
      )}
    </div>
  );
}
