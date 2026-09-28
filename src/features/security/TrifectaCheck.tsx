import { CircleCheck, ShieldAlert, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

/* The lethal trifecta (Willison) / Agents Rule of Two (Meta) as a quick check
   for a single agent session. */

const PROPS = [
  { id: 'private', label: 'Accede a datos privados o sistemas sensibles', hint: 'Correo, documentos internos, bases de datos, repos privados, CRM, credenciales.' },
  { id: 'untrusted', label: 'Procesa contenido no confiable', hint: 'Webs, emails recibidos, documentos de terceros, issues, resultados de búsqueda, otros agentes.' },
  { id: 'external', label: 'Puede cambiar estado o comunicar hacia fuera', hint: 'Enviar, publicar, hacer peticiones HTTP, escribir… y también renderizar imágenes o enlaces con URLs arbitrarias.' },
] as const

type PropId = (typeof PROPS)[number]['id']

const PAIR_ADVICE: Record<string, string> = {
  'private+untrusted':
    'Puede leer datos sensibles y contenido malicioso a la vez. Mientras no tenga ningún canal de salida está contenido, pero revisa los canales ocultos: imágenes o enlaces en Markdown, vistas previas, logs que alguien externo lee.',
  'private+external':
    'Actúa sobre datos sensibles y tiene efectos hacia fuera, pero solo con contenido de confianza. El riesgo aparece en cuanto entre texto de terceros: un email reenviado, un documento compartido, el resultado de una búsqueda.',
  'external+untrusted':
    'Lee contenido malicioso y puede actuar, pero sin acceso a nada privado. El riesgo es de abuso de sus acciones (spam, publicaciones, peticiones a terceros), no de fuga: limita destinos y acciones.',
}

export function TrifectaCheck() {
  const [on, setOn] = useState<Record<PropId, boolean>>({ private: true, untrusted: true, external: true })
  const active = PROPS.filter((p) => on[p.id]).map((p) => p.id)
  const count = active.length
  const verdict =
    count === 3
      ? { icon: ShieldAlert, color: 'var(--bad)', title: 'Trifecta completa: riesgo crítico de exfiltración', text: 'Un atacante que consiga meter texto en el contexto puede hacer que el agente lea tus datos privados y los envíe fuera. Ningún guardrail lo impide de forma fiable.' }
      : count === 2
        ? { icon: TriangleAlert, color: 'var(--warn)', title: 'Dos de tres: dentro de la regla de dos', text: PAIR_ADVICE[[...active].sort().join('+')] ?? '' }
        : { icon: CircleCheck, color: 'var(--ok)', title: 'Riesgo acotado', text: 'Con una sola propiedad (o ninguna) no hay camino para exfiltrar datos mediante inyección. Revisa igualmente el resto de superficies.' }

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-surface p-5 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Marca lo que puede hacer <b className="text-fg">un mismo agente en una misma sesión</b>. Si reúne las tres propiedades
          sin supervisión humana, la inyección de prompt se convierte en fuga de datos.
        </p>
        <div className="mt-4 space-y-2">
          {PROPS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="switch"
              aria-checked={on[p.id]}
              onClick={() => setOn({ ...on, [p.id]: !on[p.id] })}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                on[p.id] ? 'border-bad/40 bg-bad/5' : 'border-border hover:bg-surface-2',
              )}
            >
              <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border font-mono text-[11px]', on[p.id] ? 'border-bad bg-bad text-white' : 'border-border-strong text-subtle')}>
                {'ABC'[i]}
              </span>
              <span>
                <span className="block text-[14px] font-medium">{p.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">{p.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: `color-mix(in oklab, ${verdict.color} 45%, transparent)`, background: `color-mix(in oklab, ${verdict.color} 7%, transparent)` }}
      >
        <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: verdict.color }}>
          <verdict.icon className="size-4" /> <span className="text-fg">{count} de 3 propiedades</span>
        </div>
        <p className="mt-2 text-[17px] leading-snug font-semibold">{verdict.title}</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{verdict.text}</p>
        {count === 3 && (
          <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed">
            <li>· Quita una propiedad: separa en dos tareas o sesiones (una lee lo no confiable, otra toca lo privado).</li>
            <li>· Cierra la salida: allowlist de destinos, sin imágenes remotas, sin HTTP libre.</li>
            <li>· Si las tres son imprescindibles, el agente no puede actuar solo: confirmación humana de cada acción con efectos.</li>
            <li>· Aplica patrones de diseño que separen datos e instrucciones (dual LLM, plan-then-execute, CaMeL).</li>
          </ul>
        )}
        <p className="mt-4 text-[11.5px] text-subtle">Basado en «the lethal trifecta» (Simon Willison, 2025) y la «Agents Rule of Two» (Meta, 2025).</p>
      </div>
    </div>
  )
}
