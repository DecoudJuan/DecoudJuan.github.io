// The CV as a document preview, built from the same content as the rest of the site.
import { CV_PDF } from '../../../data/content';
import { useLang } from '../lang';

export default function Cv() {
  const { t, c } = useLang();
  const { PERSON: p, CV: cv } = c;
  return (
    <div className="cv">
      <div className="cv-bar">
        <span>{p.name} · CV</span>
        {CV_PDF && <a className="btn-l" href={CV_PDF} download>{t.cv.pdf}</a>}
      </div>
      <article className="cv-page">
        <header>
          <h2>{p.name}</h2>
          <p>{p.role}</p>
          <p className="cv-links">{p.email} · github.com/DecoudJuan · linkedin.com/in/decoudjuan · Buenos Aires</p>
        </header>
        <p>{cv.summary}</p>
        <h3>{t.cv.exp}</h3>
        {cv.jobs.map((j) => (
          <section key={j.org}>
            <p className="cv-row"><b>{j.org}</b> · {j.role}<span>{j.when}</span></p>
            <ul>{j.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
        <h3>{t.cv.edu}</h3>
        <ul className="cv-edu">{cv.edu.map(([y, a, b]) => <li key={a}><span>{y}</span><b>{a}</b> {b}</li>)}</ul>
        <h3>{t.cv.stack}</h3>
        <ul className="cv-edu">{c.STACK.map(([k, v]) => <li key={k}><b>{k}:</b> {v.join(', ')}</li>)}</ul>
        <h3>{t.cv.awards}</h3>
        <ul>{cv.awards.map((a) => <li key={a}>{a}</li>)}</ul>
        <h3>{t.cv.langs}</h3>
        <p>{cv.langs}</p>
      </article>
    </div>
  );
}
