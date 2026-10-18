// The terminal's virtual filesystem, built from the same content the windows show.
import { HIRE, NOW, PERSON, PROJECTS, QUOTE, STACK } from './content';

export type FsFile = { type: 'file'; body: string; open?: OpenTarget };
export type FsDir = { type: 'dir'; children: Record<string, FsNode> };
export type FsNode = FsFile | FsDir;
/** What `open` does with a file: launch an app or a project in the player. */
export type OpenTarget = { app: string } | { project: string };

const file = (body: string, open?: OpenTarget): FsFile => ({ type: 'file', body, open });
const dir = (children: Record<string, FsNode>): FsDir => ({ type: 'dir', children });

export const ROOT: FsDir = dir({
  'sobre-mi.txt': file(`${PERSON.name}\n${PERSON.role}\n\n${PERSON.bio}\n\n"${QUOTE.text}" (${QUOTE.by})`, { app: 'about' }),
  'ahora.txt': file(NOW.map(([k, v]) => `${k}: ${v}`).join('\n')),
  'stack.txt': file(STACK.map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')),
  'trabajemos-juntos.txt': file(`${HIRE.title}\n\n${HIRE.text}\n\n${HIRE.services.map((k) => `- ${k}`).join('\n')}\n\nservicios: ${HIRE.site}\nmail: ${PERSON.email}`, { app: 'hire' }),
  'contacto.txt': file(`mail: ${PERSON.email}\nlinkedin: ${PERSON.linkedin}\ngithub: ${PERSON.github}`),
  proyectos: dir(Object.fromEntries(PROJECTS.map((p) => [
    `${p.id}.md`,
    file(`# ${p.name}\n${p.kind}\n\n${p.text}${p.links.length ? '\n\n' + p.links.map(([l, u]) => `${l}: ${u}`).join('\n') : ''}`, { project: p.id }),
  ]))),
});

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

export function nodeAt(segs: string[]): FsNode | null {
  let n: FsNode = ROOT;
  for (const s of segs) {
    if (n.type !== 'dir' || !n.children[s]) return null;
    n = n.children[s];
  }
  return n;
}

export const pathLabel = (segs: string[]) => '~' + (segs.length ? '/' + segs.join('/') : '');
