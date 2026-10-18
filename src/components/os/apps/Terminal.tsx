// A small shell over the virtual filesystem in data/fs.ts: ls, cd, cat, open, tree and friends,
// with history (up/down) and Tab completion.
import { useEffect, useRef, useState } from 'react';
import { nodeAt, pathLabel, resolve, ROOT, type FsDir, type FsNode, type OpenTarget } from '../../../data/fs';
import { PERSON } from '../../../data/content';

type Line = { t: string; k?: 'cmd' | 'mut' | 'acc' | 'dir' };
type Props = { focused: boolean; onOpen: (t: OpenTarget) => void; onTheme: () => void };

const HELP = [
  'ls [ruta]        lista archivos',
  'cd <ruta>        cambia de carpeta (cd .. para subir)',
  'cat <archivo>    muestra un archivo',
  'open <archivo>   lo abre en su ventana (también: open discos, open juegos)',
  'tree             todo el sistema de archivos',
  'pwd · whoami · date · echo · history · theme · clear',
];
const APPS: Record<string, string> = { discos: 'records', proyectos: 'records', 'sobre-mi': 'about', reproductor: 'player', terminal: 'terminal', juegos: 'games', 'trabajemos-juntos': 'hire' };

function treeLines(d: FsDir, pre = ''): Line[] {
  const names = Object.keys(d.children);
  return names.flatMap((n, i) => {
    const last = i === names.length - 1, c = d.children[n];
    const line: Line = { t: `${pre}${last ? '└── ' : '├── '}${n}${c.type === 'dir' ? '/' : ''}`, k: c.type === 'dir' ? 'dir' : undefined };
    return c.type === 'dir' ? [line, ...treeLines(c, pre + (last ? '    ' : '│   '))] : [line];
  });
}

export default function Terminal({ focused, onOpen, onTheme }: Props) {
  const [lines, setLines] = useState<Line[]>([{ t: 'DecoudJuan OS. Escribí help para ver los comandos, o ls para empezar.', k: 'acc' }]);
  const [cwd, setCwd] = useState<string[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(0);
  const [val, setVal] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { if (focused) input.current?.focus({ preventScroll: true }); }, [focused]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [lines]);

  const prompt = `juan@decoudjuan:${pathLabel(cwd)}$`;

  function run(raw: string) {
    const out: Line[] = [{ t: `${prompt} ${raw}`, k: 'cmd' }];
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    const at = (p: string): [string[] | null, FsNode | null] => { const s = resolve(cwd, p || '.'); return [s, s ? nodeAt(s) : null]; };
    const say = (t: string, k?: Line['k']) => out.push({ t, k });

    switch (cmd) {
      case '': break;
      case 'help': HELP.forEach((h) => say(h, 'mut')); break;
      case 'ls': {
        const [, n] = at(args.filter((a) => !a.startsWith('-'))[0] ?? '');
        if (!n) say(`ls: no existe ${arg}`, 'mut');
        else if (n.type === 'file') say(arg);
        else say(Object.entries(n.children).map(([k, c]) => k + (c.type === 'dir' ? '/' : '')).join('   '), 'dir');
        break;
      }
      case 'cd': {
        const [s, n] = at(arg || '~');
        if (!s || !n) say(`cd: no existe ${arg}`, 'mut');
        else if (n.type !== 'dir') say(`cd: ${arg} no es una carpeta`, 'mut');
        else setCwd(s);
        break;
      }
      case 'pwd': say(pathLabel(cwd)); break;
      case 'cat': {
        const [, n] = at(arg);
        if (!arg) say('cat: decime qué archivo', 'mut');
        else if (!n) say(`cat: no existe ${arg}`, 'mut');
        else if (n.type === 'dir') say(`cat: ${arg} es una carpeta`, 'mut');
        else n.body.split('\n').forEach((l) => say(l));
        break;
      }
      case 'open': case 'abrir': {
        if (APPS[arg]) { onOpen({ app: APPS[arg] }); say(`abriendo ${arg}`, 'acc'); break; }
        const [, n] = at(arg);
        if (!n) say(`open: no existe ${arg}`, 'mut');
        else if (n.type === 'dir') { onOpen({ app: 'records' }); say('abriendo discos', 'acc'); }
        else if (n.open) { onOpen(n.open); say(`abriendo ${arg}`, 'acc'); }
        else n.body.split('\n').forEach((l) => say(l));
        break;
      }
      case 'tree': say('~', 'dir'); treeLines(ROOT).forEach((l) => out.push(l)); break;
      case 'whoami': say(`${PERSON.name}, ${PERSON.role}.`); break;
      case 'date': say(new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })); break;
      case 'echo': say(arg); break;
      case 'history': hist.forEach((h, i) => say(`${String(i + 1).padStart(3)}  ${h}`, 'mut')); break;
      case 'theme': case 'tema': onTheme(); say('tema cambiado', 'mut'); break;
      case 'clear': setLines([]); return;
      case 'sudo': say('buen intento.', 'mut'); break;
      default: say(`${cmd}: comando no encontrado. Probá help.`, 'mut');
    }
    setLines((l) => [...l, ...out]);
  }

  function complete() {
    const parts = val.split(/\s+/);
    const word = parts[parts.length - 1];
    const slash = word.lastIndexOf('/');
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '';
    const s = resolve(cwd, dirPart || '.'), n = s && nodeAt(s);
    if (!n || n.type !== 'dir') return;
    const opts = Object.entries(n.children).filter(([k]) => k.startsWith(word.slice(slash + 1)));
    if (opts.length === 1) {
      const [k, c] = opts[0];
      parts[parts.length - 1] = dirPart + k + (c.type === 'dir' ? '/' : '');
      setVal(parts.join(' '));
    } else if (opts.length > 1) {
      setLines((l) => [...l, { t: `${prompt} ${val}`, k: 'cmd' }, { t: opts.map(([k]) => k).join('   '), k: 'dir' }]);
    }
  }

  return (
    <div className="term" ref={box} onClick={() => input.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => <div key={i} className={l.k}>{l.t}</div>)}
      <form onSubmit={(e) => { e.preventDefault(); const v = val; setVal(''); if (v.trim()) { setHist((h) => [...h, v]); setHi(hist.length + 1); } run(v); }}>
        <label htmlFor="t-in">{prompt}</label>
        <input
          id="t-in" ref={input} value={val} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Comando"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') { e.preventDefault(); complete(); }
            else if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); setHi(hi - 1); setVal(hist[hi - 1]); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(hist.length, hi + 1); setHi(n); setVal(hist[n] ?? ''); }
          }}
        />
      </form>
    </div>
  );
}
