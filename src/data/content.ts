// All the text of the site lives here, so the desktop components stay presentation-only.

export type Link = [label: string, url: string];

export type Project = {
  id: string;
  name: string;
  kind: string;
  /** Small label printed on the record sleeve. */
  side: string;
  /** Sleeve colour (album art, same in both themes). */
  color: string;
  /** Sleeve pattern, see `.cover.m1` … `.m6` in global.css. */
  motif: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6';
  text: string;
  links: Link[];
  /** Full demo. Hosted outside the repo (R2 or similar); loaded only on play. */
  video?: string;
  poster?: string;
  /** [seconds, label] — only shown when there is a video. */
  chapters?: [number, string][];
};

export const PERSON = {
  name: 'Juan Manuel Decoud',
  short: 'Juan Decoud',
  role: 'Support & Integrations Engineer en Darwin AI',
  email: 'decoudjuanmanuel1@gmail.com',
  github: 'https://github.com/DecoudJuan',
  linkedin: 'https://www.linkedin.com/in/decoudjuan/',
  bio: 'Hago webs, sistemas y automatizaciones con IA para pymes. De día integro CRMs con IA en Darwin AI y estudio Ingeniería Informática en la Universidad Austral.',
  chips: ['Buenos Aires', 'freelance: abierto', 'n8n · React · Python · Rust'],
};

/** Headline: a quote about learning, adapted from Proust ("Le véritable voyage de découverte…"). */
export const QUOTE = {
  text: 'El verdadero viaje del aprendizaje no consiste en buscar nuevos paisajes, sino en mirar con nuevos ojos.',
  by: 'adaptado de Marcel Proust',
};

export const NOW = [
  ['Darwin AI', 'integraciones con CRMs y onboarding técnico'],
  ['Universidad Austral', 'plataforma de benchmarks de IA, proyecto final'],
  ['Wasp', 'auditor OWASP en Rust'],
  ['Freelance', 'abierto a proyectos nuevos'],
];

export const HIRE = {
  title: '¿Tenés un proyecto en mente?',
  text: 'Trabajo con pymes y emprendedores, de punta a punta: diseño, desarrollo y deploy, con una sola persona responsable de todo.',
  services: [
    ['Webs y landings', 'Sitios rápidos y con identidad propia, con íconos y tipografía elegidos para tu marca.'],
    ['Sistemas a medida', 'Lo que hoy vive en planillas o en un sistema viejo, pasado a una app que se usa todos los días.'],
    ['Automatizaciones con IA', 'Flujos en n8n y modelos de lenguaje conectados a tus herramientas y a tu CRM.'],
  ] as [string, string][],
  steps: [
    ['Charlamos', 'Me contás qué necesitás y qué problema querés resolver.'],
    ['Propuestas', 'Te muestro varias direcciones reales y elegís mirándolas.'],
    ['Construyo y entrego', 'Lo desarrollo, lo publico y te lo dejo andando.'],
  ] as [string, string][],
};

export const PROJECTS: Project[] = [
  {
    id: 'scout', name: 'Scout', kind: '1.er puesto · hackatón 2026', side: 'Lado A · 2026', color: '#2f5d46', motif: 'm1',
    text: 'Ordena los 72 partidos de grupos del Mundial 2026 para cada persona con un modelo bayesiano en el navegador. Cada pulgar arriba o abajo actualiza el modelo. El LLM traduce y redacta, nunca decide: si la API se cae, la app sigue clasificando.',
    links: [['Probarlo', 'https://scout-austral.github.io/'], ['Código', 'https://github.com/scout-austral/scout-austral.github.io']],
  },
  {
    id: 'vexa', name: 'Vexa', kind: 'Facturación · Windows y Android', side: 'Lado A · 2026', color: '#7a2e22', motif: 'm2',
    text: 'Reemplazó un sistema en Microsoft Access. Factura electrónica con ARCA (SOAP, firma CMS y QR de la RG 4291) y reintentos que nunca emiten dos veces la misma factura. Las reglas de negocio son escenarios Gherkin.',
    links: [['Descargar', 'https://github.com/DecoudJuan/Vexa/releases/latest'], ['Código', 'https://github.com/DecoudJuan/Vexa']],
  },
  {
    id: 'wasp', name: 'Wasp', kind: 'Auditor OWASP · Rust', side: 'Lado A · en progreso', color: '#9c6f1e', motif: 'm3',
    text: 'Semgrep, Gitleaks y Trivy encuentran candidatos y el modelo sólo confirma y explica los que importan. Una caché incremental bajó un monorepo grande de 142 s a 6 s, y en CI frena el pipeline por encima de un umbral de severidad.',
    links: [['Código', 'https://github.com/DecoudJuan/Wasp']],
  },
  {
    id: 'guitar', name: 'Guitar Learning', kind: 'Cámara · navegador', side: 'Lado B · 2026', color: '#1f3550', motif: 'm4',
    text: 'Una clase de guitarra que mira: la cámara encuentra el diapasón y la mano que pisa, y te dice qué dedo va en cada traste. Corre entera en el navegador.',
    links: [['Probarlo', 'https://guitar-learning-ten.vercel.app'], ['Código', 'https://github.com/DecoudJuan/Guitar-Learning']],
  },
  {
    id: 'bench', name: 'Benchmarks IA', kind: 'Proyecto final · cliente real', side: 'Lado B · capstone', color: '#55552a', motif: 'm5',
    text: 'Una plataforma que compara modelos y agentes de IA entre distintos harnesses, para que los resultados sean comparables y no anécdotas: paridad, aislamiento de corridas, costo, latencia y resultados que se puedan defender.',
    links: [],
  },
  {
    id: 'snippet', name: 'Snippet Searcher', kind: 'Lenguaje propio · 8 servicios', side: 'Lado B · en equipo', color: '#3a2c24', motif: 'm6',
    text: 'PrintScript, un lenguaje escrito desde cero en Kotlin, y la plataforma de 8 servicios con Auth0 en Azure, con CI/CD en Docker que reconstruye sólo el contenedor que cambió. Mi parte: arquitectura, VMs y todo el pipeline.',
    links: [],
  },
];

export const STACK: [string, string[]][] = [
  ['IA y automatización', ['OpenAI API', 'n8n', 'Zapier', 'Webhooks', 'Claude Code']],
  ['Lenguajes', ['Python', 'TypeScript', 'Rust', 'Kotlin', 'Java']],
  ['Web', ['React', 'Astro', 'NestJS', 'Flask', 'Express']],
  ['Cloud y DevOps', ['Azure', 'Docker', 'GitHub Actions']],
  ['Datos', ['PostgreSQL', 'SQLite', 'Prisma', 'SQLAlchemy']],
  ['Integraciones', ['HubSpot', 'Salesforce', 'Pipedrive', 'OAuth 2.0']],
];
