// "What plays while I code": a Spotify embed once MUSIC_EMBED is set; until then, an
// equalizer that moves and a note saying where the playlist goes.
import Penguin from '../Penguin';
import { MUSIC_EMBED } from '../../../data/content';
import { useLang } from '../lang';

export default function Music() {
  const { t } = useLang();
  return (
    <div className="music">
      <div className="music-head">
        <span className="music-pm"><Penguin interactive={false} label={t.aboutPenguin} /></span>
        <div>
          <h2>{t.music.title}</h2>
          <div className="eq" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ['--d' as string]: `${(i * 137) % 900}ms` }} />)}</div>
        </div>
      </div>
      {MUSIC_EMBED ? (
        <iframe className="music-embed" title={t.music.title} src={MUSIC_EMBED} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
      ) : (
        <p className="music-empty">{t.music.empty}</p>
      )}
    </div>
  );
}
