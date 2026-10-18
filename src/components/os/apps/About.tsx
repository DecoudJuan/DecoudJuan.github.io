import { useState } from 'react';
import Penguin from '../Penguin';
import { PERSON, PHRASES } from '../../../data/content';

export default function About() {
  const [i, setI] = useState(0);
  return (
    <div className="about">
      <div className="about-av"><Penguin label="Pingüino de Juan, con anteojos y auriculares. Tocalo." /></div>
      <div className="about-tx">
        <p className="about-name">{PERSON.name}</p>
        <h1 className="phrase" key={i}>{PHRASES[i]}</h1>
        <button type="button" className="ph-next" onClick={() => setI((i + 1) % PHRASES.length)} aria-label="Ver otra frase">
          otra frase <span aria-hidden="true">{i + 1}/{PHRASES.length}</span>
        </button>
        <p className="about-bio">{PERSON.bio}</p>
        <div className="chips">{PERSON.chips.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
    </div>
  );
}
