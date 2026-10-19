// A small shell over the virtual filesystem in data/fs.ts: ls, cd, cat, open, tree, a couple
// of easter eggs (neofetch, pingusay), history (up/down) and Tab completion.
import { useEffect, useRef, useState } from 'react';
import { nodeAt, pathLabel, resolve, rootFor, type FsDir, type FsNode, type OpenTarget } from '../../../data/fs';
import { useLang } from '../lang';

type Line = { t: string; k?: 'cmd' | 'mut' | 'acc' | 'dir' };
type Props = { focused: boolean; onOpen: (t: OpenTarget) => void; onTheme: () => void; onExit: () => void };

const APPS: Record<string, string> = {
  discos: 'records', records: 'records', proyectos: 'records', projects: 'records', 'sobre-mi': 'about', about: 'about',
  reproductor: 'player', player: 'player', terminal: 'terminal', juegos: 'games', games: 'games', musica: 'music', 'música': 'music', music: 'music',
  notas: 'notes', notes: 'notes', cv: 'cv', papelera: 'trash', trash: 'trash', 'trabajemos-juntos': 'hire', hire: 'hire',
};

const PENGU = [
  '      .--.     ',
  '     |o_o |    ',
  '     |:_/ |    ',
  '    //   \\ \\   ',
  '   (|     | )  ',
  "  /'\\_   _/`\\  ",
  '  \\___)=(___/  ',
];

function treeLines(d: FsDir, pre = ''): Line[] {
  const names = Object.keys(d.children).filter((n) => !n.startsWith('.'));
  return names.flatMap((n, i) => {
    const last = i === names.length - 1, c = d.children[n];
    const line: Line = { t: `${pre}${last ? '└── ' : '├── '}${n}${c.type === 'dir' ? '/' : ''}`, k: c.type === 'dir' ? 'dir' : undefined };
    return c.type === 'dir' ? [line, ...treeLines(c, pre + (last ? '    ' : '│   '))] : [line];
  });
}

function bubble(text: string): string[] {
  const words = (text || '...').split(/\s+/), rows: string[] = [];
  let cur = '';
  words.forEach((w) => { if ((cur + ' ' + w).trim().length > 34) { rows.push(cur.trim()); cur = w; } else cur += ' ' + w; });
  rows.push(cur.trim());
  const w = Math.max(...rows.map((r) => r.length));
  return [` ${'_'.repeat(w + 2)}`, ...rows.map((r) => `< ${r.padEnd(w)} >`), ` ${'-'.repeat(w + 2)}`, '      \\', ...PENGU.map((p) => '       ' + p)];
}

export default function Terminal({ focused, onOpen, onTheme, onExit }: Props) {
  const { lang, t, c } = useLang();
  const T = t.term;
  const root = rootFor(lang);
  const [lines, setLines] = useState<Line[]>([{ t: T.hello, k: 'acc' }]);
  const [cwd, setCwd] = useState<string[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(0);
  const [val, setVal] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { if (focused) input.current?.focus({ preventScroll: true }); }, [focused]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [lines]);
  // Paths differ per language: going back to ~ on a language switch avoids a dangling cwd.
  useEffect(() => { setCwd([]); setLines((l) => (l.length <= 1 ? [{ t: T.hello, k: 'acc' }] : l)); }, [lang, T.hello]);

  const prompt = `juan@decoudjuan:${pathLabel(cwd)}$`;

  function run(raw: string) {
    const out: Line[] = [{ t: `${prompt} ${raw}`, k: 'cmd' }];
    const [cmd = '', ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    const at = (p: string): [string[] | null, FsNode | null] => { const s = resolve(cwd, p || '.'); return [s, s ? nodeAt(root, s) : null]; };
    const say = (x: string, k?: Line['k']) => out.push({ t: x, k });

    switch (cmd) {
      case '': break;
      case 'help': T.help.forEach((h) => say(h, 'mut')); break;
      case 'ls': {
        const all = args.includes('-a') || args.includes('-la');
        const target = args.filter((a) => !a.startsWith('-'))[0] ?? '';
        const [, n] = at(target);
        if (!n) say(`ls: ${target}: ${T.noSuch}`, 'mut');
        else if (n.type === 'file') say(target);
        else say(Object.entries(n.children).filter(([k]) => all || !k.startsWith('.')).map(([k, x]) => k + (x.type === 'dir' ? '/' : '')).join('   '), 'dir');
        break;
      }
      case 'cd': {
        const [s, n] = at(arg || '~');
        if (!s || !n) say(`cd: ${arg}: ${T.noSuch}`, 'mut');
        else if (n.type !== 'dir') say(`cd: ${arg}: ${T.notDir}`, 'mut');
        else setCwd(s);
        break;
      }
      case 'pwd': say(pathLabel(cwd)); break;
      case 'cat': {
        const [, n] = at(arg);
        if (!arg) say(`cat: ${T.which}`, 'mut');
        else if (!n) say(`cat: ${arg}: ${T.noSuch}`, 'mut');
        else if (n.type === 'dir') say(`cat: ${arg}: ${T.isDir}`, 'mut');
        else n.body.split('\n').forEach((l) => say(l));
        break;
      }
      case 'open': case 'abrir': {
        if (APPS[arg]) { onOpen({ app: APPS[arg] }); say(`${T.opening} ${arg}`, 'acc'); break; }
        const [, n] = at(arg);
        if (!n) say(`open: ${arg}: ${T.noSuch}`, 'mut');
        else if (n.type === 'dir') { onOpen({ app: 'records' }); say(`${T.opening} ${arg}`, 'acc'); }
        else if (n.open) { onOpen(n.open); say(`${T.opening} ${arg}`, 'acc'); }
        else n.body.split('\n').forEach((l) => say(l));
        break;
      }
      case 'tree': say('~', 'dir'); treeLines(root).forEach((l) => out.push(l)); break;
      case 'whoami': say(`${c.PERSON.name}, ${c.PERSON.role}.`); break;
      case 'date': say(new Date().toLocaleString(lang === 'es' ? 'es-AR' : 'en-US', { timeZone: 'America/Argentina/Buenos_Aires' })); break;
      case 'echo': say(arg); break;
      case 'history': hist.forEach((h, i) => say(`${String(i + 1).padStart(3)}  ${h}`, 'mut')); break;
      case 'theme': case 'tema': onTheme(); say(T.theme, 'mut'); break;
      case 'neofetch': {
        const info = [
          'juan@decoudjuan', '---------------', 'OS: DecoudJuan OS', 'Host: Buenos Aires, AR', `Kernel: ${c.PERSON.role}`,
          `Shell: ${lang === 'es' ? 'castellano rioplatense' : 'Spanish, English (B2)'}`, 'Stack: TypeScript, Python, Rust, n8n', `Uptime: ${lang === 'es' ? 'desde 2023 en la Austral' : 'at Universidad Austral since 2023'}`,
        ];
        PENGU.forEach((p, i) => say(`${p}  ${info[i] ?? ''}`, i === 0 ? 'acc' : undefined));
        break;
      }
      case 'pingusay': case 'cowsay': bubble(arg).forEach((l) => say(l)); break;
      case 'exit': setLines([{ t: T.hello, k: 'acc' }]); setCwd([]); onExit(); return;
      case 'clear': setLines([]); return;
      case 'sudo': say(T.sudo, 'mut'); break;
      default: say(`${cmd}: ${T.notFound}`, 'mut');
    }
    setLines((l) => [...l, ...out]);
  }

  /** Completes the last word; returns false when there is nothing to complete (Tab then moves focus as usual). */
  function complete(): boolean {
    const parts = val.split(/\s+/);
    const word = parts[parts.length - 1];
    const slash = word.lastIndexOf('/');
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '';
    const s = resolve(cwd, dirPart || '.'), n = s && nodeAt(root, s);
    if (!n || n.type !== 'dir') return false;
    const opts = Object.entries(n.children).filter(([k]) => k.startsWith(word.slice(slash + 1)));
    if (opts.length === 1) {
      const [k, x] = opts[0];
      parts[parts.length - 1] = dirPart + k + (x.type === 'dir' ? '/' : '');
      setVal(parts.join(' '));
    } else if (opts.length > 1) {
      setLines((l) => [...l, { t: `${prompt} ${val}`, k: 'cmd' }, { t: opts.map(([k]) => k).join('   '), k: 'dir' }]);
    }
    return opts.length > 0;
  }

  return (
    <div className="term" ref={box} onClick={() => input.current?.focus({ preventScroll: true })}>
      <div role="log" aria-live="polite">{lines.map((l, i) => <div key={i} className={l.k}>{l.t}</div>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); const v = val; setVal(''); if (v.trim()) { setHist((h) => [...h, v]); setHi(hist.length + 1); } run(v); }}>
        <label htmlFor="t-in">{prompt}</label>
        <input
          id="t-in" ref={input} value={val} autoComplete="off" autoCapitalize="off" spellCheck={false}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && val.trim() && complete()) e.preventDefault();
            else if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); setHi(hi - 1); setVal(hist[hi - 1]); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(hist.length, hi + 1); setHi(n); setVal(hist[n] ?? ''); }
          }}
        />
      </form>
    </div>
  );
}
