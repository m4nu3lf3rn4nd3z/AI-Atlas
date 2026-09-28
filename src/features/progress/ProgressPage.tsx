import { Download, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, SectionLabel } from '@/components/ui/primitives'
import { CONCEPTS, conceptsInLayer, hasContent, WRITTEN_COUNT } from '@/content'
import { LAYERS } from '@/content/layers'
import { copyText } from '@/lib/clipboard'
import { statusOf, useProgress } from '@/stores/progress'
import { recommendNext } from './recommend'

export default function ProgressPage() {
  const concepts = useProgress((s) => s.concepts)
  const reset = useProgress((s) => s.reset)
  const importData = useProgress((s) => s.importData)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const learned = CONCEPTS.filter((c) => concepts[c.id]?.learnedAt)
  const visited = CONCEPTS.filter((c) => statusOf(concepts[c.id]) === 'visited')
  const next = recommendNext(concepts)
  const exportJson = JSON.stringify({ app: 'ai-atlas', version: 1, concepts }, null, 2)

  const onImport = async (file: File) => {
    try {
      const ok = importData(JSON.parse(await file.text()))
      setMessage(ok ? 'Progreso importado.' : 'El fichero no tiene el formato esperado.')
    } catch {
      setMessage('No se pudo leer el fichero.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Tu progreso</h1>
      <p className="mt-3 text-[15px] text-muted">
        Se guarda solo en este navegador. Un concepto cuenta como aprendido al superar su quiz con un 80%
        (o si lo marcas a mano).
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Aprendidos" value={`${learned.length}/${WRITTEN_COUNT}`} color="var(--ok)" />
        <Stat label="Visitados sin completar" value={String(visited.length)} color="var(--l2)" />
        <Stat label="Siguiente recomendado" value={next?.title ?? '¡Todo al día!'} small link={next ? `/c/${next.id}` : undefined} />
      </div>

      <section className="mt-10 space-y-2">
        <SectionLabel className="mb-3">Por capa</SectionLabel>
        {LAYERS.map((layer) => {
          const cs = conceptsInLayer(layer.id)
          const written = cs.filter((c) => hasContent(c.id))
          const done = cs.filter((c) => concepts[c.id]?.learnedAt).length
          return (
            <div key={layer.id} className="flex items-center gap-3" style={{ '--layer': layer.color } as CSSProperties}>
              <span className="w-48 truncate text-[13px]">
                <span className="mr-2 font-mono text-[11px] text-[var(--layer)]">{layer.index}</span>
                {layer.title}
              </span>
              <div className="flex h-2 flex-1 gap-0.5">
                {cs.map((c) => (
                  <span
                    key={c.id}
                    className="flex-1 rounded-full"
                    style={{
                      background: concepts[c.id]?.learnedAt
                        ? 'var(--layer)'
                        : hasContent(c.id)
                          ? 'var(--border-strong)'
                          : 'var(--surface-3)',
                    }}
                  />
                ))}
              </div>
              <span className="w-24 text-right font-mono text-[11px] text-subtle">
                {done}/{written.length} · {cs.length}
              </span>
            </div>
          )
        })}
      </section>

      <Card className="mt-10 p-5">
        <SectionLabel>Tus datos</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () =>
              setMessage(
                (await copyText(exportJson))
                  ? 'Progreso copiado al portapapeles como JSON.'
                  : 'No se pudo copiar en este navegador.',
              )
            }
          >
            <Download /> Copiar como JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload /> Importar JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
          {confirming ? (
            <span className="flex items-center gap-2 text-[13px]">
              ¿Borrar todo el progreso?
              <Button
                size="sm"
                variant="outline"
                className="border-bad/50 text-bad"
                onClick={() => {
                  reset()
                  setConfirming(false)
                  setMessage('Progreso borrado.')
                }}
              >
                Sí, borrar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              <RotateCcw /> Reiniciar
            </Button>
          )}
        </div>
        {message && <p className="mt-3 text-[12.5px] text-muted">{message}</p>}
      </Card>
    </div>
  )
}

function Stat({ label, value, color, small, link }: { label: string; value: string; color?: string; small?: boolean; link?: string }) {
  const body = (
    <Card className="h-full p-4">
      <SectionLabel>{label}</SectionLabel>
      <p className={small ? 'mt-2 text-[15px] font-medium' : 'mt-1 text-2xl font-semibold tabular-nums'} style={{ color }}>
        {value}
      </p>
    </Card>
  )
  return link ? <Link to={link}>{body}</Link> : body
}
