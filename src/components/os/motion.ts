// Motion is off when the system asks for reduced motion or when the visitor pauses the animations
// from the menu bar. The choice is stored and set as data-still on <html> (Base.astro applies it
// before first paint); the CSS stops every animation and transition under that attribute.
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export const motionOff = () => document.documentElement.hasAttribute('data-still') || matchMedia(QUERY).matches;

export function setStill(on: boolean) {
  document.documentElement.toggleAttribute('data-still', on);
  try { localStorage.setItem('still', on ? '1' : '0'); } catch { /* not remembered */ }
  dispatchEvent(new Event('motionchange'));
}

/** For effects that run their own animation loop: re-run them when motion turns on or off. */
export function useMotionOff() {
  // Not rendered, so reading the DOM here can't cause a hydration mismatch.
  const [off, setOff] = useState(() => typeof document !== 'undefined' && motionOff());
  useEffect(() => {
    const mq = matchMedia(QUERY), sync = () => setOff(motionOff());
    sync();
    addEventListener('motionchange', sync);
    mq.addEventListener('change', sync);
    return () => { removeEventListener('motionchange', sync); mq.removeEventListener('change', sync); };
  }, []);
  return off;
}
