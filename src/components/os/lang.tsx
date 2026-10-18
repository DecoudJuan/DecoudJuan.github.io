// Language context: Spanish by default; an explicit choice is remembered in the browser.
import { createContext, useContext } from 'react';
import { getContent, type Lang } from '../../data/content';
import { UI } from '../../data/i18n';

export const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'es', setLang: () => {} });

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  return { lang, setLang, t: UI[lang], c: getContent(lang) };
}

export function storedLang(): Lang | null {
  try { const l = localStorage.getItem('lang'); return l === 'en' || l === 'es' ? l : null; } catch { return null; }
}
export function storeLang(l: Lang) {
  try { localStorage.setItem('lang', l); } catch { /* not remembered */ }
  document.documentElement.lang = l;
}
