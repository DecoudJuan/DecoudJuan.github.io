// All the text of the site, in Spanish and English. Components read it through useLang();
// nothing user-facing is hard-coded in the desktop components.
export type Lang = 'es' | 'en';
type T = { es: string; en: string };
const pick = (t: T, l: Lang) => t[l];

export type LinkKind = 'try' | 'code' | 'download';
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
  links: [LinkKind, string][];
  /** Full demo. Hosted outside the repo (R2 or similar); loaded only on play. */
  video?: string;
  poster?: string;
  /** [seconds, label]; only shown when there is a video. */
  chapters?: [number, string][];
};

const LINKS = {
  email: 'decoudjuanmanuel1@gmail.com',
  github: 'https://github.com/DecoudJuan',
  linkedin: 'https://www.linkedin.com/in/decoudjuan/',
  site: 'https://juandecoud.pages.dev/',
};

/** Spotify embed for the Música app, e.g. https://open.spotify.com/embed/playlist/<id>. Empty until Juan picks one. */
export const MUSIC_EMBED = '';
/** CV PDF under /public. Empty until the file is in the repo; the download button is hidden meanwhile. */
export const CV_PDF = '';

const PROJECTS: (Omit<Project, 'kind' | 'side' | 'text'> & { kind: T; side: T; text: T })[] = [
  {
    id: 'scout', name: 'Scout', color: '#2f5d46', motif: 'm1',
    kind: { es: '1.er puesto · hackatón 2026', en: '1st place · 2026 hackathon' },
    side: { es: 'Lado A · 2026', en: 'Side A · 2026' },
    text: {
      es: 'Ordena los 72 partidos de grupos del Mundial 2026 para cada persona con un modelo bayesiano en el navegador. Cada pulgar arriba o abajo actualiza el modelo. El LLM traduce y redacta, nunca decide: si la API se cae, la app sigue clasificando.',
      en: 'Sorts the 72 group-stage matches of the 2026 World Cup for each person with a Bayesian model in the browser. Every thumbs up or down updates the model. The LLM translates and writes, it never decides: if the API is down, the app keeps classifying.',
    },
    links: [['try', 'https://scout-austral.github.io/'], ['code', 'https://github.com/scout-austral/scout-austral.github.io']],
  },
  {
    id: 'vexa', name: 'Vexa', color: '#7a2e22', motif: 'm2',
    kind: { es: 'Facturación · Windows y Android', en: 'Invoicing · Windows and Android' },
    side: { es: 'Lado A · 2026', en: 'Side A · 2026' },
    text: {
      es: 'Reemplazó un sistema en Microsoft Access. Factura electrónica con ARCA (SOAP, firma CMS y QR de la RG 4291) y reintentos que nunca emiten dos veces la misma factura. Las reglas de negocio son escenarios Gherkin.',
      en: 'Replaced a Microsoft Access system. Argentine e-invoicing through ARCA (SOAP, CMS signing and the RG 4291 QR) with retries that never issue the same invoice twice. The business rules are Gherkin scenarios.',
    },
    links: [['download', 'https://github.com/DecoudJuan/Vexa/releases/latest'], ['code', 'https://github.com/DecoudJuan/Vexa']],
  },
  {
    id: 'wasp', name: 'Wasp', color: '#9c6f1e', motif: 'm3',
    kind: { es: 'Auditor OWASP · Rust', en: 'OWASP auditor · Rust' },
    side: { es: 'Lado A · en progreso', en: 'Side A · in progress' },
    text: {
      es: 'Semgrep, Gitleaks y Trivy encuentran candidatos y el modelo sólo confirma y explica los que importan. Una caché incremental bajó un monorepo grande de 142 s a 6 s, y en CI frena el pipeline por encima de un umbral de severidad.',
      en: 'Semgrep, Gitleaks and Trivy find candidates and the model only confirms and explains the ones that matter. An incremental cache took a large monorepo from 142 s to 6 s, and in CI it blocks the pipeline above a severity threshold.',
    },
    links: [['code', 'https://github.com/DecoudJuan/Wasp']],
  },
  {
    id: 'guitar', name: 'Guitar Learning', color: '#1f3550', motif: 'm4',
    kind: { es: 'Cámara · navegador', en: 'Camera · browser' },
    side: { es: 'Lado B · 2026', en: 'Side B · 2026' },
    text: {
      es: 'Una clase de guitarra que mira: la cámara encuentra el diapasón y la mano que pisa, y te dice qué dedo va en cada traste. Corre entera en el navegador.',
      en: 'A guitar lesson that watches: the camera finds the fretboard and your fretting hand and tells you which finger goes where. It runs entirely in the browser.',
    },
    links: [['try', 'https://guitar-learning-ten.vercel.app'], ['code', 'https://github.com/DecoudJuan/Guitar-Learning']],
  },
  {
    id: 'bench', name: 'Benchmarks IA', color: '#55552a', motif: 'm5',
    kind: { es: 'Proyecto final · cliente real', en: 'Capstone · real client' },
    side: { es: 'Lado B · capstone', en: 'Side B · capstone' },
    text: {
      es: 'Una plataforma que compara modelos y agentes de IA entre distintos harnesses, para que los resultados sean comparables y no anécdotas: paridad, aislamiento de corridas, costo, latencia y resultados que se puedan defender.',
      en: 'A platform that benchmarks AI models and agents across harnesses, so results are comparable instead of anecdotal: parity, run isolation, cost, latency and results you can defend.',
    },
    links: [],
  },
  {
    id: 'snippet', name: 'Snippet Searcher', color: '#3a2c24', motif: 'm6',
    kind: { es: 'Lenguaje propio · 8 servicios', en: 'Own language · 8 services' },
    side: { es: 'Lado B · en equipo', en: 'Side B · team project' },
    text: {
      es: 'PrintScript, un lenguaje escrito desde cero en Kotlin, y la plataforma de 8 servicios con Auth0 en Azure, con CI/CD en Docker que reconstruye sólo el contenedor que cambió. Mi parte: arquitectura, VMs y todo el pipeline.',
      en: 'PrintScript, a language written from scratch in Kotlin, and its 8-service platform with Auth0 on Azure, with Docker CI/CD that rebuilds only the container that changed. My part: architecture, VMs and the whole pipeline.',
    },
    links: [],
  },
];

const TRASH: { name: string; year: string; what: T; url: string }[] = [
  { name: 'Ajedrez y damas', year: '2025', what: { es: 'Motor en Java con Strategy, Adapter y Observer, GUI en Swing y JUnit.', en: 'Java engine on Strategy, Adapter and Observer, Swing GUI and JUnit.' }, url: 'https://github.com/austral-ingsis-classroom/chess-DecoudJuan' },
  { name: 'Ubica2', year: '2024', what: { es: 'Estacionamientos en Flask y PostgreSQL, con roles, chat y notificaciones.', en: 'Parking management in Flask and PostgreSQL, with roles, chat and notifications.' }, url: 'https://github.com/DecoudJuan/Laboratorio1' },
  { name: 'Portatic', year: '2024', what: { es: 'Control de acceso con ESP32 y MQTT, y llaves digitales en Flask (en equipo).', en: 'Access control with ESP32 and MQTT, digital keys in Flask (team project).' }, url: 'https://github.com/emmabeni27/Portatic' },
  { name: 'ESP key', year: '2024', what: { es: 'ESP8266 y ESP32 por ESP-NOW que validan una clave para prender LEDs.', en: 'ESP8266 and ESP32 talking over ESP-NOW to validate a key and light LEDs.' }, url: 'https://github.com/DecoudJuan/ESP_project-key' },
  { name: 'Pokédex', year: '2025', what: { es: 'Entrenamiento de Laboratorio II: React y NestJS.', en: 'Lab II warm-up: React and NestJS.' }, url: 'https://github.com/DecoudJuan/pokedex-api-app' },
  { name: 'TP Cálculo', year: '2023', what: { es: 'Trabajo práctico de Cálculo en Python.', en: 'Calculus assignment in Python.' }, url: 'https://github.com/DecoudJuan/TPCalculo' },
  { name: 'Taller de programación', year: '2023', what: { es: 'El primer repo: practicar git en el Taller de Programación 1.', en: 'The very first repo: practising git in Programming Workshop 1.' }, url: 'https://github.com/DecoudJuan/tallergitprog1' },
];

const STACK: [T, string[]][] = [
  [{ es: 'IA y automatización', en: 'AI and automation' }, ['OpenAI API', 'n8n', 'Zapier', 'Webhooks', 'Claude Code']],
  [{ es: 'Lenguajes', en: 'Languages' }, ['Python', 'TypeScript', 'Rust', 'Kotlin', 'Java']],
  [{ es: 'Web', en: 'Web' }, ['React', 'Astro', 'NestJS', 'Flask', 'Express']],
  [{ es: 'Cloud y DevOps', en: 'Cloud and DevOps' }, ['Azure', 'Docker', 'GitHub Actions']],
  [{ es: 'Datos', en: 'Data' }, ['PostgreSQL', 'SQLite', 'Prisma', 'SQLAlchemy']],
  [{ es: 'Integraciones', en: 'Integrations' }, ['HubSpot', 'Salesforce', 'Pipedrive', 'OAuth 2.0']],
];

const EDU: [string, T, T][] = [
  ['2023 –', { es: 'Ingeniería Informática, Universidad Austral', en: 'Computer Engineering, Universidad Austral' }, { es: '72,6 % de la carrera y 45 materias aprobadas.', en: '72.6% of the degree done, 45 courses passed.' }],
  ['2026', { es: 'Laboratorio III · proyecto final', en: 'Laboratorio III · capstone' }, { es: 'Plataforma de benchmarks de modelos y agentes de IA para un cliente real.', en: 'Benchmarking platform for AI models and agents, for a real client.' }],
  ['2026', { es: 'Aseguramiento de la Calidad', en: 'Software Quality Assurance' }, { es: 'TDD, BDD y automatización de tests.', en: 'TDD, BDD and test automation.' }],
  ['2025', { es: 'Ingeniería de Sistemas', en: 'Systems Engineering' }, { es: 'PrintScript y Snippet Searcher: 8 servicios en Azure con CI/CD.', en: 'PrintScript and Snippet Searcher: 8 services on Azure with CI/CD.' }],
  ['2025', { es: 'Laboratorio II', en: 'Laboratorio II' }, { es: 'Sonora: React, NestJS y Azure con product owners de quinto año.', en: 'Sonora: React, NestJS and Azure with fifth-year product owners.' }],
];

function build(l: Lang) {
  const t = (x: T) => pick(x, l);
  return {
    PERSON: {
      name: 'Juan Manuel Decoud',
      role: t({ es: 'Support & Integrations Engineer en Darwin AI', en: 'Support & Integrations Engineer at Darwin AI' }),
      bio: t({
        es: 'Hago webs, sistemas y automatizaciones con IA para pymes. De día integro CRMs con IA en Darwin AI y estudio Ingeniería Informática en la Universidad Austral.',
        en: 'I build websites, custom systems and AI automations for small businesses. By day I integrate CRMs with AI at Darwin AI, and I study Computer Engineering at Universidad Austral.',
      }),
      chips: ['Buenos Aires', t({ es: 'freelance: abierto', en: 'freelance: open' }), 'n8n · React · Python · Rust'],
      ...LINKS,
    },
    QUOTE: {
      text: t({
        es: 'El verdadero viaje del aprendizaje no consiste en buscar nuevos paisajes, sino en mirar con nuevos ojos.',
        en: 'The real voyage of learning consists not in seeking new landscapes, but in having new eyes.',
      }),
      by: t({ es: 'adaptado de Marcel Proust', en: 'adapted from Marcel Proust' }),
    },
    NOW: [
      ['Darwin AI', t({ es: 'integraciones con CRMs y onboarding técnico', en: 'CRM integrations and technical onboarding' })],
      ['Universidad Austral', t({ es: 'plataforma de benchmarks de IA, proyecto final', en: 'AI benchmarking platform, capstone' })],
      ['Wasp', t({ es: 'auditor OWASP en Rust', en: 'OWASP auditor in Rust' })],
      ['Freelance', t({ es: 'abierto a proyectos nuevos', en: 'open to new projects' })],
    ] as [string, string][],
    HIRE: {
      title: t({ es: '¿Tenés un proyecto?', en: 'Got a project?' }),
      text: t({
        es: 'Sistemas a medida, webs y automatizaciones con IA para pymes. Hablás directo con quien lo construye.',
        en: 'Custom systems, websites and AI automations for small businesses. You talk directly to the person who builds it.',
      }),
      services: [t({ es: 'Webs y landings', en: 'Websites and landings' }), t({ es: 'Sistemas a medida', en: 'Custom systems' }), t({ es: 'Automatizaciones con IA', en: 'AI automations' })],
      site: LINKS.site,
    },
    PROJECTS: PROJECTS.map((p) => ({ ...p, kind: t(p.kind), side: t(p.side), text: t(p.text) })) as Project[],
    STACK: STACK.map(([k, v]) => [t(k), v]) as [string, string[]][],
    TRASH: TRASH.map((x) => ({ ...x, what: t(x.what) })),
    CV: {
      summary: t({
        es: 'Ingeniero de soporte e integraciones. Automatizaciones, integraciones con CRMs y flujos con LLMs en producción; productos propios publicados y proyectos freelance para pymes.',
        en: 'Support and integrations engineer. Automations, CRM integrations and LLM workflows in production; shipped products of my own and freelance work for small businesses.',
      }),
      jobs: [{
        org: 'Darwin AI', role: 'Support & Integrations Engineer',
        when: t({ es: 'jul 2025 – hoy · pasantía y luego part-time', en: 'Jul 2025 – present · intern, then part-time' }),
        items: [
          t({ es: 'Flujos completos en n8n y Zapier: webhooks, ramas condicionales y transformaciones.', en: 'End-to-end flows in n8n and Zapier: webhooks, branching and data transformations.' }),
          t({ es: 'Nodos de LLM en producción para clasificar leads y extraer datos, con la salida validada.', en: 'LLM nodes in production for lead classification and extraction, with validated output.' }),
          t({ es: 'Integraciones con HubSpot, Salesforce y Pipedrive: mapeo de campos y OAuth 2.0.', en: 'HubSpot, Salesforce and Pipedrive integrations: field mapping and OAuth 2.0.' }),
          t({ es: 'Diagnóstico de flujos rotos y errores de API, y onboarding técnico de clientes.', en: 'Triage of broken flows and API errors, and technical customer onboarding.' }),
        ],
      }],
      edu: EDU.map(([y, a, b]) => [y, t(a), t(b)]) as [string, string, string][],
      awards: [t({ es: '1.er puesto, hackatón Mundial Austral 2026 (Scout)', en: '1st place, Mundial Austral 2026 hackathon (Scout)' })],
      langs: t({ es: 'Español nativo · Inglés B2', en: 'Spanish (native) · English (B2)' }),
    },
  };
}

export type Content = ReturnType<typeof build>;
const cache: Partial<Record<Lang, Content>> = {};
export const getContent = (l: Lang): Content => (cache[l] ??= build(l));
