// Recent public commits, read at build time (see src/data/github.ts). Hidden when empty.
import type { Activity } from '../../data/github';
import { useLang } from './lang';

function ago(iso: string, lang: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { numeric: 'auto' });
  if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  return rtf.format(-Math.round(s / 86400), 'day');
}

export default function GitHubWidget({ items }: { items: Activity[] }) {
  const { lang, t } = useLang();
  if (!items.length) return null;
  return (
    <aside className="gh" aria-label={t.gh.title}>
      <b>{t.gh.title}</b>
      <ul>
        {items.map((a) => (
          <li key={a.url + a.msg}>
            <a href={a.url} target="_blank" rel="noopener"><strong>{a.repo}</strong> {a.msg}</a>
            <small>{ago(a.date, lang)}</small>
          </li>
        ))}
      </ul>
    </aside>
  );
}
