import Penguin from '../Penguin';
import { PERSON, QUOTE } from '../../../data/content';

export default function About() {
  return (
    <div className="about">
      <div className="about-av"><Penguin interactive={false} label="Pingüino de Juan, con anteojos y auriculares." /></div>
      <div className="about-tx">
        <p className="about-name">{PERSON.name}</p>
        <figure className="quote">
          <blockquote><h1>{QUOTE.text}</h1></blockquote>
          <figcaption>{QUOTE.by}</figcaption>
        </figure>
        <p className="about-bio">{PERSON.bio}</p>
        <div className="chips">{PERSON.chips.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
    </div>
  );
}
