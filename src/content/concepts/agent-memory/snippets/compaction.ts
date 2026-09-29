// Compactación: cuando el historial supera un presupuesto, se resumen los turnos
// antiguos y el resumen sustituye a los originales.
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
type Msg = { role: 'user' | 'assistant'; content: string }

const BUDGET = 20_000 // tokens de historial
const KEEP_RECENT = 6 // turnos que se conservan literales

export async function compact(history: Msg[]): Promise<Msg[]> {
  const { input_tokens } = await client.messages.countTokens({ model: 'claude-opus-5-5', messages: history })
  if (input_tokens <= BUDGET || history.length <= KEEP_RECENT) return history

  const old = history.slice(0, -KEEP_RECENT)
  const summary = await client.messages.create({
    model: 'claude-haiku-4-5-20251001', // resumir es una tarea sencilla
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content:
          'Resume esta conversación conservando decisiones, datos concretos (cifras, ids, fechas) y tareas pendientes. ' +
          'Omite saludos y rodeos.\n\n' +
          old.map((m) => `${m.role}: ${m.content}`).join('\n'),
      },
    ],
  })
  const text = summary.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')

  // El historial vuelve a empezar por un turno del usuario con el resumen.
  const recent = history.slice(-KEEP_RECENT)
  const head: Msg = { role: 'user', content: `Resumen de la conversación anterior:\n${text}` }
  return recent[0]?.role === 'user' ? [head, { role: 'assistant', content: 'Entendido.' }, ...recent] : [head, ...recent]
}
