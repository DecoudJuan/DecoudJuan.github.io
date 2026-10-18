// Notes app: list on the left, the note on the right (stacked when narrow).
import { NOTES } from '../../../data/notes';
import { useLang } from '../lang';

export default function Notes({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  const { lang, t } = useLang();
  const note = NOTES.find((n) => n.id === current) ?? NOTES[0];
  return (
    <div className="notes">
      <nav className="notes-list" aria-label={t.notes.list}>
        {NOTES.map((n) => (
          <button key={n.id} type="button" aria-current={n.id === note.id} onClick={() => onPick(n.id)}>
            <b>{n.title[lang]}</b>
            <small>{n.date}{n.draft ? ` · ${t.notes.draft}` : ''}</small>
          </button>
        ))}
      </nav>
      <article className="note-body" key={note.id + lang}>
        <p className="note-meta">{note.date}{note.draft && <span>{t.notes.draft}</span>}</p>
        <h2>{note.title[lang]}</h2>
        {note.body[lang].map((p, i) => <p key={i}>{p}</p>)}
      </article>
    </div>
  );
}
