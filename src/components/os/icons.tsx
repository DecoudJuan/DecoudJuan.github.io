// App icons: one family. Each is a rounded tile (.appicon, colour in --tile) with a glyph
// drawn on a 48-unit grid and optically centred on (24, 24). Same artwork in the dock,
// the desktop and the phone home screen.
import type { ReactNode } from 'react';
import Penguin from './Penguin';
import type { AppId } from './types';

const CREAM = '#f3ead8';
const tile = (bg: string, glyph: ReactNode, cls = '') => (
  <span className={'appicon ' + cls} style={{ ['--tile' as string]: bg }} aria-hidden="true">
    <svg viewBox="0 0 48 48">{glyph}</svg>
  </span>
);

export const ICONS: Record<AppId, ReactNode> = {
  about: (
    <span className="appicon pengu" style={{ ['--tile' as string]: '#efe6d6' }} aria-hidden="true">
      <Penguin still />
    </span>
  ),
  records: tile('#211913', <>
    <circle cx="24" cy="24" r="14.5" fill="#0d0a08" />
    <circle cx="24" cy="24" r="11.5" fill="none" stroke="#3b3029" strokeWidth=".9" />
    <circle cx="24" cy="24" r="8.8" fill="none" stroke="#3b3029" strokeWidth=".9" />
    <circle cx="24" cy="24" r="5.4" fill="#e0aa4f" />
    <circle cx="24" cy="24" r="1.3" fill="#0d0a08" />
  </>),
  player: tile('#7a2e22', <path d="M19.5 15.5 33.5 24 19.5 32.5Z" fill={CREAM} stroke={CREAM} strokeWidth="3" strokeLinejoin="round" />),
  notes: tile('#f0dc97', <path d="M15 18h18M15 24h18M15 30h11" stroke="#3a2e14" strokeWidth="2.8" strokeLinecap="round" />),
  music: tile('#c98a2c', <>
    <path d="M20.5 31V16.6l13-3V28" fill="none" stroke={CREAM} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
    <ellipse cx="17" cy="31" rx="3.8" ry="3.1" fill={CREAM} />
    <ellipse cx="30" cy="28" rx="3.8" ry="3.1" fill={CREAM} />
  </>),
  terminal: tile('#15110d', <>
    <path d="m15 18.5 5.5 5.5-5.5 5.5" fill="none" stroke="#e0aa4f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24.5 30h9" stroke="#e9dcc4" strokeWidth="2.8" strokeLinecap="round" />
  </>),
  games: tile('#2f5d46', <>
    <rect x="9.5" y="17" width="29" height="14" rx="7" fill={CREAM} />
    <path d="M17 21v6M14 24h6" stroke="#2f5d46" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="30" cy="22.5" r="1.9" fill="#c98a2c" />
    <circle cx="33.4" cy="25.6" r="1.9" fill="#c98a2c" />
  </>),
  cv: tile('#fbf8f2', <>
    <path d="M17 11.5h10.5l5.5 5.5v19a1.5 1.5 0 0 1-1.5 1.5h-14.5a1.5 1.5 0 0 1-1.5-1.5v-23a1.5 1.5 0 0 1 1.5-1.5Z" fill="#fff" stroke="#1e1914" strokeWidth="2" strokeLinejoin="round" />
    <path d="M27.5 11.5V17h5.5" fill="none" stroke="#1e1914" strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 23h9M20 27.5h9M20 32h5.5" stroke="#8a5a14" strokeWidth="2" strokeLinecap="round" />
  </>, 'light'),
  hire: tile('#1f3550', <>
    <path d="M19.5 18v-2.2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2V18" fill="none" stroke={CREAM} strokeWidth="2.4" />
    <rect x="11.5" y="18" width="25" height="16" rx="3.5" fill={CREAM} />
    <path d="M11.5 25.5h25" stroke="#1f3550" strokeWidth="1.6" />
    <rect x="21.8" y="23.3" width="4.4" height="4.4" rx="1" fill="#c98a2c" />
  </>),
  trash: tile('#8b8478', <>
    <path d="M13.5 17.5h21" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M21 17.5v-2.6h6v2.6" fill="none" stroke={CREAM} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M16 20h16l-1.3 13.3a2 2 0 0 1-2 1.7h-9.4a2 2 0 0 1-2-1.7Z" fill={CREAM} />
    <path d="M21.4 23.5v8M26.6 23.5v8" stroke="#8b8478" strokeWidth="1.8" strokeLinecap="round" />
  </>),
};

export const LINK_ICONS = {
  github: tile('#1e1914', (
    <path transform="translate(12 12)" fill={CREAM} d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
  )),
  linkedin: tile('#2a5d8f', <>
    <circle cx="17.2" cy="16.4" r="2.2" fill={CREAM} />
    <path d="M17.2 21.5v11M23 32.5v-11m0 5.2c0-3.4 1.7-5.4 4.4-5.4s4.1 1.8 4.1 5v6.2" fill="none" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
  </>),
};
