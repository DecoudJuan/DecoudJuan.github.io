// Theme: "system" by default; an explicit choice is stored and set as data-theme on <html>.
// Base.astro applies the stored choice before first paint.
export const isDark = () => {
  const t = document.documentElement.getAttribute('data-theme');
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

function apply(t: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('theme', t); } catch { /* storage blocked: the choice just isn't remembered */ }
  window.dispatchEvent(new Event('themechange'));
}

/** Toggle with a circle that grows from the click point (View Transitions), or instantly. */
export function toggleTheme(e?: { clientX: number; clientY: number }) {
  const next = isDark() ? 'light' : 'dark';
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }).startViewTransition;
  if (!vt || matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(next); return; }
  const x = e?.clientX ?? innerWidth / 2, y = e?.clientY ?? innerHeight / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  vt.call(document, () => apply(next)).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
}
