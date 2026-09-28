// npm i gpt-tokenizer
import { countTokens } from 'gpt-tokenizer/encoding/o200k_base'

type Message = { role: 'system' | 'user' | 'assistant'; content: string }

/**
 * Recorta el historial para que quepa en un presupuesto de tokens:
 * conserva siempre el mensaje de sistema y los turnos más recientes.
 * (El conteo es aproximado si tu modelo usa otro tokenizador.)
 */
export function trimHistory(messages: Message[], budget: number): Message[] {
  const [system, ...rest] = messages[0]?.role === 'system' ? messages : [undefined, ...messages]
  let used = system ? countTokens(system.content) : 0
  const kept: Message[] = []

  for (let i = rest.length - 1; i >= 0; i--) {
    const m = rest[i]!
    const cost = countTokens(m.content) + 4 // margen por los tokens especiales de cada turno
    if (used + cost > budget) break
    used += cost
    kept.unshift(m)
  }
  return system ? [system, ...kept] : kept
}

const history: Message[] = [
  { role: 'system', content: 'Eres un asistente de soporte técnico.' },
  { role: 'user', content: 'Mi router no enciende. '.repeat(50) },
  { role: 'assistant', content: '¿Has comprobado el cable de corriente?' },
  { role: 'user', content: 'Sí, y la luz sigue apagada.' },
]
console.log(trimHistory(history, 60).map((m) => m.role)) // [ 'system', 'assistant', 'user' ]
