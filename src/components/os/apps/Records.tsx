// Projects as records on a shelf. Hovering pulls the vinyl a little out of its sleeve
// (no spinning); clicking opens the project in the player.
import { useLang } from '../lang';

export default function Records({ onOpen }: { onOpen: (id: string) => void }) {
  const { t, c } = useLang();
  return (
    <div className="records">
      <div className="shelf">
        {c.PROJECTS.map((p) => (
          <button key={p.id} type="button" className="disc" style={{ ['--c' as string]: p.color }} onClick={() => onOpen(p.id)} aria-label={`${t.recordsOpen} ${p.name}`}>
            <span className="vin" aria-hidden="true" />
            <span className={'cover ' + p.motif}>
              <i aria-hidden="true" />
              <small>{p.side}</small>
              <b>{p.name}</b>
            </span>
            <span className="disc-k">{p.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
