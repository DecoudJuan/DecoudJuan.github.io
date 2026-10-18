// Notes about things learned while building. These first ones are drafts written from the
// project descriptions; Juan reviews them (`draft: true` shows a "borrador" tag).
import type { Lang } from './content';

type Note = { id: string; date: string; draft?: boolean; title: Record<Lang, string>; body: Record<Lang, string[]> };

export const NOTES: Note[] = [
  {
    id: 'el-modelo-no-decide', date: '2026-06', draft: true,
    title: { es: 'El modelo no decide', en: "The model doesn't decide" },
    body: {
      es: [
        'En Scout lo obvio era dejar que un LLM recomendara los partidos. Lo descarté: no se puede explicar, no da siempre lo mismo y no aprende de lo que le decís.',
        'La decisión la toma un modelo bayesiano chico que corre en el navegador. GPT-4o hace dos cosas, y ninguna es decidir: traduce una frase a preferencias y redacta la justificación que el modelo ya calculó.',
        'Si la API se cae, la app sigue clasificando los 72 partidos. El LLM mejora la experiencia, pero nunca es el único punto de falla.',
      ],
      en: [
        'In Scout the obvious move was to let an LLM recommend the matches. I dropped it: it can\'t be explained, it isn\'t reproducible and it doesn\'t learn from your feedback.',
        'A small Bayesian model running in the browser makes the call. GPT-4o does two things, neither of them deciding: it turns one sentence into preferences and writes up the justification the model already computed.',
        'If the API goes down, the app still classifies all 72 matches. The LLM improves the experience; it is never a single point of failure.',
      ],
    },
  },
  {
    id: 'primero-lo-determinista', date: '2026-08', draft: true,
    title: { es: 'Primero lo determinista, después el modelo', en: 'Deterministic first, then the model' },
    body: {
      es: [
        'Darle un repositorio entero a un LLM para buscar vulnerabilidades es caro y ruidoso. En Wasp el flujo va al revés.',
        'Herramientas que ya funcionan (Semgrep, Gitleaks, Trivy) encuentran candidatos, y el modelo sólo gasta tokens en confirmar y explicar los que importan.',
        'Lo mismo vale para el tiempo: con una caché que sólo vuelve a escanear lo que cambió, un monorepo grande pasó de 142 segundos a 6.',
      ],
      en: [
        'Handing a whole repository to an LLM to find vulnerabilities is expensive and noisy. Wasp inverts the flow.',
        'Proven tools (Semgrep, Gitleaks, Trivy) find candidates, and the model only spends tokens confirming and explaining the ones that matter.',
        'The same goes for time: with a cache that only re-scans what changed, a large monorepo went from 142 seconds to 6.',
      ],
    },
  },
  {
    id: 'reintentar-sin-duplicar', date: '2026-09', draft: true,
    title: { es: 'Un reintento no puede facturar dos veces', en: "A retry can't invoice twice" },
    body: {
      es: [
        'En Vexa lo difícil no fue la interfaz sino la factura electrónica: servicios SOAP, firma digital y tokens que vencen.',
        'Cuando una llamada falla a mitad de camino, reintentar es fácil. Lo que no puede pasar es que el reintento emita la misma factura dos veces.',
        'Por eso cada envío se puede repetir sin efectos dobles, y las reglas de negocio están escritas como escenarios: si una regla cambia, hay un solo lugar donde cambiarla.',
      ],
      en: [
        'In Vexa the hard part wasn\'t the UI but e-invoicing: SOAP services, digital signatures and expiring tokens.',
        'When a call fails halfway, retrying is easy. What can\'t happen is a retry issuing the same invoice twice.',
        'So every submission can be repeated without double effects, and the business rules are written as scenarios: when a rule changes, there is exactly one place to change it.',
      ],
    },
  },
];
