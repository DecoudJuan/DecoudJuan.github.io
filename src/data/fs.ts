// The terminal's virtual filesystem, built from the same content the windows show.
import { getContent, type Lang } from './content';
import { NOTES } from './notes';

export type FsFile = { type: 'file'; body: string; open?: OpenTarget };
export type FsDir = { type: 'dir'; children: Record<string, FsNode> };
export type FsNode = FsFile | FsDir;
/** What `open` does with a file: launch an app or a project in the player, or a note. */
export type OpenTarget = { app: string } | { project: string } | { note: string };

const file = (body: string, open?: OpenTarget): FsFile => ({ type: 'file', body, open });
const dir = (children: Record<string, FsNode>): FsDir => ({ type: 'dir', children });

function build(l: Lang): FsDir {
  const c = getContent(l), es = l === 'es';
  const { PERSON: p, QUOTE: q, HIRE: h, CV: cv } = c;
  return dir({
    [es ? 'sobre-mi.txt' : 'about-me.txt']: file(`${p.name}\n${p.role}\n\n${p.bio}\n\n"${q.text}" (${q.by})`, { app: 'about' }),
    [es ? 'ahora.txt' : 'now.txt']: file(c.NOW.map(([k, v]) => `${k}: ${v}`).join('\n')),
    'stack.txt': file(c.STACK.map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')),
    [es ? 'trabajemos-juntos.txt' : 'work-with-me.txt']: file(`${h.title}\n\n${h.text}\n\n${h.services.map((s) => `- ${s}`).join('\n')}\n\n${h.site}\n${p.email}`, { app: 'hire' }),
    [es ? 'contacto.txt' : 'contact.txt']: file(`mail: ${p.email}\nlinkedin: ${p.linkedin}\ngithub: ${p.github}`),
    'cv.txt': file([p.name, p.role, '', cv.summary, '', ...cv.jobs.flatMap((j) => [`${j.org} · ${j.role} (${j.when})`, ...j.items.map((i) => `  - ${i}`)]), '', ...cv.edu.map(([y, a, b]) => `${y}  ${a}: ${b}`), '', cv.langs].join('\n'), { app: 'cv' }),
    [es ? 'proyectos' : 'projects']: dir(Object.fromEntries(c.PROJECTS.map((x) => [
      `${x.id}.md`,
      file(`# ${x.name}\n${x.kind}\n\n${x.text}${x.links.length ? '\n\n' + x.links.map(([, u]) => u).join('\n') : ''}`, { project: x.id }),
    ]))),
    [es ? 'notas' : 'notes']: dir(Object.fromEntries(NOTES.map((n) => [`${n.id}.md`, file(`# ${n.title[l]}\n\n${n.body[l].join('\n\n')}`, { note: n.id })]))),
    '.papelera': dir(Object.fromEntries(c.TRASH.map((x) => [`${x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`, file(`${x.name} (${x.year})\n${x.what}\n${x.url}`, { app: 'trash' })]))),
  });
}

const cache: Partial<Record<Lang, FsDir>> = {};
export const rootFor = (l: Lang) => (cache[l] ??= build(l));

/** Resolve a path (absolute with ~, or relative to cwd) to a list of segments under ~. */
export function resolve(cwd: string[], path: string): string[] | null {
  const parts = path.startsWith('~') ? path.slice(1).split('/') : [...cwd, ...path.split('/')];
  const out: string[] = [];
  for (const p of parts) {
    if (!p || p === '.') continue;
    if (p === '..') { if (!out.length) return null; out.pop(); } else out.push(p);
  }
  return out;
}

export function nodeAt(root: FsDir, segs: string[]): FsNode | null {
  let n: FsNode = root;
  for (const s of segs) {
    if (n.type !== 'dir' || !n.children[s]) return null;
    n = n.children[s];
  }
  return n;
}

export const pathLabel = (segs: string[]) => '~' + (segs.length ? '/' + segs.join('/') : '');
