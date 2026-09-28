// npm i gpt-tokenizer
import { decode, encode, isWithinTokenLimit } from 'gpt-tokenizer/encoding/o200k_base'

const text = 'La tokenización no es trivial'
const ids = encode(text)
console.log(ids.length, ids.map((id) => decode([id])))
// 6 [ 'La', ' token', 'ización', ' no', ' es', ' trivial' ]

// Antes de enviar un documento largo, comprueba si cabe en tu presupuesto.
// Devuelve false si lo supera, o el número de tokens si cabe.
function fitsBudget(document: string, maxTokens: number) {
  const count = isWithinTokenLimit(document, maxTokens)
  return count === false ? { fits: false as const } : { fits: true as const, count }
}

console.log(fitsBudget(text.repeat(2_000), 8_000)) // { fits: false }
