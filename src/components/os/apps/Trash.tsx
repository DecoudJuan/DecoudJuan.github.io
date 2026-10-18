// The trash: old university projects, each with a "restore" that opens its repository.
import { useLang } from '../lang';

export default function Trash() {
  const { t, c } = useLang();
  return (
    <div className="trash">
      <p className="trash-h">{t.trash.title} · {c.TRASH.length} {t.trash.items}</p>
      <ul>
        {c.TRASH.map((x) => (
          <li key={x.name}>
            <span className="trash-ic" aria-hidden="true" />
            <span className="trash-tx"><b>{x.name}</b><small>{x.year} · {x.what}</small></span>
            <a className="btn-o" href={x.url} target="_blank" rel="noopener">{t.trash.restore}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
