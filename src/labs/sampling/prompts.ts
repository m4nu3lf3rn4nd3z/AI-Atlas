/* Prompts for the sampling lab. Pure data: scripts/gen-sampling.mjs imports
   this file to capture the model's real next-token distributions.

   Each prompt is a chat turn, the way an instruct model is actually used:
   the user message goes through the model's chat template and the
   assistant's answer starts with `prefix`. */

export interface SamplingPrompt {
  id: string
  label: string
  user: string
  /** Start of the assistant's answer; the lab predicts what comes next. */
  prefix: string
}

export const PROMPTS: readonly SamplingPrompt[] = [
  { id: 'capital', label: 'Un hecho', user: '¿Cuál es la capital de Francia?', prefix: 'La capital de Francia es' },
  { id: 'sky', label: 'Una descripción', user: 'Describe el cielo en una frase.', prefix: 'El cielo es' },
  { id: 'food', label: 'Una preferencia', user: 'Inventa cuál es tu comida favorita.', prefix: 'Mi comida favorita es' },
  { id: 'story', label: 'Un cuento', user: 'Empieza un cuento infantil.', prefix: 'Había una vez un' },
  { id: 'math', label: 'Una cuenta', user: '¿Cuánto es 17 × 3? Responde solo con el número.', prefix: '' },
  {
    id: 'code',
    label: 'Código',
    user: 'Escribe una función factorial recursiva en Python.',
    prefix: '```python\ndef factorial(n):\n    if n == 0:\n        return',
  },
]
