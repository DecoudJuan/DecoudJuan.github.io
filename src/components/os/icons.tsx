// App icons: Phosphor glyphs (duotone) on rounded tiles. The same artwork
// is used in the dock, the desktop and the phone home screen. Only "Sobre mí" keeps the penguin.
import type { ReactNode } from 'react';
import {
  Briefcase, FileText, GameController, GithubLogo, LinkedinLogo, MonitorPlay, MusicNotes, Notepad, TerminalWindow, Trash, VinylRecord,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import Penguin from './Penguin';
import type { AppId } from './types';

// One treatment for every tile: the colours come from --tile-bg / --tile-fg in global.css, so the
// dock reads as one set. "Sobre mí" is the only accent tile.
const tile = (Glyph: Icon) => (
  <span className="appicon" aria-hidden="true">
    <Glyph weight="duotone" className="glyph" />
  </span>
);

export const ICONS: Record<AppId, ReactNode> = {
  about: (
    <span className="appicon pengu" aria-hidden="true">
      <Penguin still />
    </span>
  ),
  records: tile(VinylRecord),
  player: tile(MonitorPlay),
  notes: tile(Notepad),
  music: tile(MusicNotes),
  terminal: tile(TerminalWindow),
  games: tile(GameController),
  cv: tile(FileText),
  hire: tile(Briefcase),
  trash: tile(Trash),
};

export const LINK_ICONS = {
  github: tile(GithubLogo),
  linkedin: tile(LinkedinLogo),
};
