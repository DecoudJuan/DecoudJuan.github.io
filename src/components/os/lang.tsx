// Language context. Each language has its own URL (/ and /en/); an explicit choice is remembered
// in the browser, and Base.astro sends a returning visitor of / to /en/ if that was their pick.
import { createContext, useContext } from 'react';
import { getContent, type Lang } from '../../data/content';
import { UI } from '../../data/i18n';

export const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'es', setLang: () => {} });

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  return { lang, setLang, t: UI[lang], c: getContent(lang) };
}

/** Switch language in place: remember it, and move the URL, title and description to that language. */
export function storeLang(l: Lang) {
  try { localStorage.setItem('lang', l); } catch { /* not remembered */ }
  const m = UI[l].meta;
  document.documentElement.lang = l;
  document.title = m.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', m.description);
  history.replaceState(history.state, '', m.path + location.hash);
}
