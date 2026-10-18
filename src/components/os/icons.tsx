// App icons: Phosphor glyphs (duotone) on rounded tiles, one colour per app. The same artwork
// is used in the dock, the desktop and the phone home screen. Only "Sobre mí" keeps the penguin.
import type { ReactNode } from 'react';
import {
  Briefcase, FileText, GameController, GithubLogo, LinkedinLogo, MonitorPlay, MusicNotes, Notepad, TerminalWindow, Trash, VinylRecord,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import Penguin from './Penguin';
import type { AppId } from './types';

const CREAM = '#f6eedf';
const tile = (bg: string, Glyph: Icon, color = CREAM, cls = '') => (
  <span className={'appicon ' + cls} style={{ ['--tile' as string]: bg }} aria-hidden="true">
    <Glyph weight="duotone" color={color} className="glyph" />
  </span>
);

export const ICONS: Record<AppId, ReactNode> = {
  about: (
    <span className="appicon pengu" style={{ ['--tile' as string]: '#efe6d6' }} aria-hidden="true">
      <Penguin still />
    </span>
  ),
  records: tile('#241b14', VinylRecord, '#e7b866'),
  player: tile('#8a3324', MonitorPlay),
  notes: tile('#f0dc97', Notepad, '#3a2e14', 'light'),
  music: tile('#c98a2c', MusicNotes),
  terminal: tile('#17120e', TerminalWindow, '#e7b866'),
  games: tile('#2f6a4f', GameController),
  cv: tile('#fbf8f2', FileText, '#8a5a14', 'light'),
  hire: tile('#21395a', Briefcase),
  trash: tile('#8b8478', Trash),
};

export const LINK_ICONS = {
  github: tile('#1e1914', GithubLogo),
  linkedin: tile('#2a5d8f', LinkedinLogo),
};
