// App icons: Phosphor glyphs (duotone) on rounded tiles. The same artwork
// is used in the dock, the desktop and the phone home screen. Only "Sobre mí" keeps the penguin.
import type { ReactNode } from 'react';
import {
  Briefcase, FileText, GameController, GithubLogo, LinkedinLogo, MonitorPlay, MusicNotes, Notepad, TerminalWindow, Trash, VinylRecord,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import Penguin from './Penguin';
import type { AppId } from './types';

// One treatment for every tile: a light tile (--tile-bg) and the glyph in one of the four tones of
// the palette (--tone-1 … --tone-4 in global.css). "Sobre mí" is the accent tile.
const tile = (Glyph: Icon, tone: 1 | 2 | 3 | 4) => (
  <span className="appicon" style={{ ['--tile-fg' as string]: `var(--tone-${tone})` }} aria-hidden="true">
    <Glyph weight="duotone" className="glyph" />
  </span>
);

export const ICONS: Record<AppId, ReactNode> = {
  about: (
    <span className="appicon pengu" aria-hidden="true">
      <Penguin still />
    </span>
  ),
  records: tile(VinylRecord, 2),
  player: tile(MonitorPlay, 1),
  notes: tile(Notepad, 3),
  music: tile(MusicNotes, 2),
  terminal: tile(TerminalWindow, 4),
  games: tile(GameController, 1),
  cv: tile(FileText, 4),
  hire: tile(Briefcase, 3),
  trash: tile(Trash, 4),
};

export const LINK_ICONS = {
  github: tile(GithubLogo, 4),
  linkedin: tile(LinkedinLogo, 4),
};
