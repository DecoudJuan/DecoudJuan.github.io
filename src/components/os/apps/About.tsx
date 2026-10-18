import Penguin from '../Penguin';
import { useLang } from '../lang';

export default function About() {
  const { t, c } = useLang();
  return (
    <div className="about">
      <div className="about-av"><Penguin interactive={false} label={t.aboutPenguin} /></div>
      <div className="about-tx">
        <p className="about-name">{c.PERSON.name}</p>
        <figure className="quote">
          <blockquote><h1>{c.QUOTE.text}</h1></blockquote>
          <figcaption>{c.QUOTE.by}</figcaption>
        </figure>
        <p className="about-bio">{c.PERSON.bio}</p>
        <div className="chips">{c.PERSON.chips.map((x) => <span key={x}>{x}</span>)}</div>
      </div>
    </div>
  );
}
