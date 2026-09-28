// npm i @anthropic-ai/sdk
// Mismo problema, distinto esfuerzo: mide cuánto cómputo (tokens) y tiempo cuesta pensar más.
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
const question =
  'Tengo 3 cajas: una con manzanas, otra con naranjas y otra mezclada. Todas las etiquetas están mal. ' +
  'Sacando una sola fruta de una sola caja, ¿cómo etiqueto las tres correctamente?'

for (const effort of ['low', 'medium', 'high'] as const) {
  const t0 = performance.now()
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    output_config: { effort },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: question }],
  })
  const seconds = ((performance.now() - t0) / 1000).toFixed(1)
  console.log(`${effort.padEnd(6)} ${response.usage.output_tokens} tokens de salida · ${seconds} s · ${response.stop_reason}`)
}
