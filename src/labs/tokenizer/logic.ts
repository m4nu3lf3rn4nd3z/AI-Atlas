export interface TextStats {
  chars: number
  words: number
  tokens: number
  charsPerToken: number
  tokensPerWord: number
}

/** Characters are counted as Unicode code points, not UTF-16 units. */
export function textStats(text: string, tokens: number): TextStats {
  const chars = [...text].length
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0
  return {
    chars,
    words,
    tokens,
    charsPerToken: tokens ? chars / tokens : 0,
    tokensPerWord: words ? tokens / words : 0,
  }
}

/** Cost in USD for `tokens` at `pricePerMillion` USD per 1M tokens. */
export function tokenCost(tokens: number, pricePerMillion: number): number {
  return (tokens / 1_000_000) * pricePerMillion
}

export const PRESETS = [
  {
    id: 'es',
    label: 'Español',
    text: 'La inteligencia artificial generativa está transformando la manera en que desarrollamos software.',
  },
  {
    id: 'en',
    label: 'Inglés',
    text: 'Generative artificial intelligence is transforming the way we develop software.',
  },
  {
    id: 'code',
    label: 'Código',
    text: 'def fibonacci(n):\n    if n < 2:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)',
  },
  {
    id: 'json',
    label: 'JSON',
    text: '{"name": "Ada", "role": "engineer", "skills": ["python", "rust"], "active": true}',
  },
  { id: 'numbers', label: 'Números', text: '1234567 + 89 = 1234656. Pi vale 3,14159 y e vale 2.71828.' },
  { id: 'emoji', label: 'Emojis', text: 'Hola 👋🏽 ¿cómo estás? 🚀✨ Todo bien 😄' },
  { id: 'long', label: 'Palabras largas', text: 'El electroencefalografista consultó al otorrinolaringólogo.' },
  { id: 'strawberry', label: 'strawberry', text: '¿Cuántas erres tiene la palabra strawberry?' },
] as const
