// Interface strings (labels, buttons, messages) in Spanish and English.
import type { Lang } from './content';

const es = {
  app: {
    about: ['Sobre mí', '~/sobre-mi.txt'], records: ['Discos', '~/discos'], player: ['Reproductor', 'reproductor'],
    terminal: ['Terminal', 'juan@decoudjuan: ~'], games: ['Juegos', 'juegos'], hire: ['Trabajemos juntos', 'Trabajemos juntos'],
    music: ['Música', 'música'], notes: ['Notas', '~/notas'], cv: ['CV', 'cv.pdf'], trash: ['Papelera', 'papelera'],
  } as Record<string, [string, string]>,
  now: 'Ahora',
  link: { try: 'Probarlo', code: 'Código', download: 'Descargar' },
  aboutPenguin: 'Pingüino de Juan, con anteojos y auriculares.',
  recordsOpen: 'Abrir',
  player: { demo: 'Demo de', soon: 'Acá va el video. Carga recién cuando le das play.', list: 'Demos', speed: 'Velocidad', resume: 'seguís en', chapters: 'Capítulos', all: 'Todas las demos' },
  hire: { cta: 'Ver mis servicios', copy: 'Copiar mail', copied: 'Mail copiado', open: 'Abrir' },
  games: {
    tabs: 'Juegos', points: 'puntos', best: 'récord', cells: 'casillas', won: 'ganadas',
    help: { pingu: 'Espacio o tocar para saltar', snake: 'Flechas o deslizar · comé pescados', mines: 'Clic para abrir · clic derecho o mantener para marcar' },
    pinguStart: 'Tocá o apretá espacio para empezar.', pinguDead: 'Chocaste. Tocá o apretá espacio para seguir.',
    snakeStart: 'Apretá una flecha para empezar.', snakeDead: 'Fin. Apretá una flecha para jugar de nuevo.',
    minesLeft: 'minas por marcar', minesWon: 'Ganaste. Tocá para jugar otra.', minesLost: 'Boom. Tocá para jugar otra.',
    sound: 'Sonido', start: 'TOCÁ PARA EMPEZAR', over: 'GAME OVER', again: 'TOCÁ PARA SEGUIR',
  },
  term: {
    hello: 'DecoudJuan OS. Escribí help para ver los comandos, o ls para empezar.',
    help: [
      'ls [ruta]        lista archivos',
      'cd <ruta>        cambia de carpeta (cd .. para subir)',
      'cat <archivo>    muestra un archivo',
      'open <archivo>   lo abre en su ventana (también: open discos, open juegos, open cv)',
      'tree             todo el sistema de archivos',
      'neofetch · pingusay <texto> · pwd · whoami · date · echo · history · theme · clear · exit',
    ],
    notFound: 'comando no encontrado. Probá help.', noSuch: 'no existe', notDir: 'no es una carpeta', isDir: 'es una carpeta', which: 'decime qué archivo',
    opening: 'abriendo', theme: 'tema cambiado', sudo: 'buen intento.',
  },
  spot: { placeholder: 'Buscá apps, proyectos, notas o acciones', empty: 'Nada con ese nombre.', app: 'App', project: 'Proyecto', note: 'Nota', action: 'Acción', open: 'Buscar' },
  action: { theme: 'Cambiar tema claro u oscuro', lang: 'Switch to English', wall: 'Fondo de pantalla:' },
  wall: { auto: 'Automático', roble: 'Roble', nogal: 'Nogal', noche: 'Noche polar' },
  menu: { theme: 'Cambiar tema', lang: 'Idioma', wall: 'Fondo de pantalla', search: 'Buscar' },
  gh: { title: 'Actividad en GitHub', ago: 'hace' },
  music: { title: 'Lo que suena mientras programo' },
  notes: { draft: 'borrador', list: 'Notas' },
  cv: { exp: 'Experiencia', edu: 'Formación', stack: 'Stack', langs: 'Idiomas', awards: 'Premios', pdf: 'Descargar PDF' },
  trash: { title: 'Proyectos viejos de la facultad', restore: 'Restaurar', items: 'elementos' },
  home: 'Inicio',
};

const en: typeof es = {
  app: {
    about: ['About me', '~/about-me.txt'], records: ['Records', '~/records'], player: ['Player', 'player'],
    terminal: ['Terminal', 'juan@decoudjuan: ~'], games: ['Games', 'games'], hire: ['Work with me', 'Work with me'],
    music: ['Music', 'music'], notes: ['Notes', '~/notes'], cv: ['CV', 'cv.pdf'], trash: ['Trash', 'trash'],
  },
  now: 'Now',
  link: { try: 'Try it', code: 'Code', download: 'Download' },
  aboutPenguin: "Juan's penguin, with glasses and headphones.",
  recordsOpen: 'Open',
  player: { demo: 'Demo of', soon: 'The video goes here. It only loads when you press play.', list: 'Demos', speed: 'Speed', resume: 'resuming at', chapters: 'Chapters', all: 'All demos' },
  hire: { cta: 'See my services', copy: 'Copy email', copied: 'Email copied', open: 'Open' },
  games: {
    tabs: 'Games', points: 'points', best: 'best', cells: 'cells', won: 'won',
    help: { pingu: 'Space or tap to jump', snake: 'Arrows or swipe · eat the fish', mines: 'Click to open · right-click or hold to flag' },
    pinguStart: 'Tap or press space to start.', pinguDead: 'Crashed. Tap or press space to go again.',
    snakeStart: 'Press an arrow to start.', snakeDead: 'Game over. Press an arrow to play again.',
    minesLeft: 'mines left to flag', minesWon: 'You won. Tap to play again.', minesLost: 'Boom. Tap to play again.',
    sound: 'Sound', start: 'TAP TO START', over: 'GAME OVER', again: 'TAP TO RETRY',
  },
  term: {
    hello: 'DecoudJuan OS. Type help to see the commands, or ls to start.',
    help: [
      'ls [path]        list files',
      'cd <path>        change directory (cd .. to go up)',
      'cat <file>       print a file',
      'open <file>      open it in its window (also: open records, open games, open cv)',
      'tree             the whole filesystem',
      'neofetch · pingusay <text> · pwd · whoami · date · echo · history · theme · clear · exit',
    ],
    notFound: 'command not found. Try help.', noSuch: 'no such file or directory', notDir: 'not a directory', isDir: 'is a directory', which: 'which file?',
    opening: 'opening', theme: 'theme changed', sudo: 'nice try.',
  },
  spot: { placeholder: 'Search apps, projects, notes or actions', empty: 'Nothing by that name.', app: 'App', project: 'Project', note: 'Note', action: 'Action', open: 'Search' },
  action: { theme: 'Toggle light or dark theme', lang: 'Cambiar a español', wall: 'Wallpaper:' },
  wall: { auto: 'Automatic', roble: 'Oak', nogal: 'Walnut', noche: 'Polar night' },
  menu: { theme: 'Toggle theme', lang: 'Language', wall: 'Wallpaper', search: 'Search' },
  gh: { title: 'GitHub activity', ago: 'ago' },
  music: { title: 'What plays while I code' },
  notes: { draft: 'draft', list: 'Notes' },
  cv: { exp: 'Experience', edu: 'Education', stack: 'Stack', langs: 'Languages', awards: 'Awards', pdf: 'Download PDF' },
  trash: { title: 'Old university projects', restore: 'Restore', items: 'items' },
  home: 'Home',
};

export const UI: Record<Lang, typeof es> = { es, en };
export type UIStrings = typeof es;
