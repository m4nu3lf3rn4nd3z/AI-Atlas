// Embeddings en el navegador (o en Node) con Transformers.js: sin servidor y sin
// que el texto salga del dispositivo. Es lo que hace el lab de embeddings.
import { pipeline } from '@huggingface/transformers'

const extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
  dtype: 'q8', // pesos int8: 118 MB en lugar de 470 MB
})

const texts = ['query: ¿Cuánto tarda un envío a Tenerife?', 'passage: Los envíos a Canarias tardan de 5 a 7 días.']
const output = await extractor(texts, { pooling: 'mean', normalize: true })
const [q, d] = output.tolist() as number[][]

const cosine = q!.reduce((sum, x, i) => sum + x * d![i]!, 0) // vectores normalizados: coseno = producto escalar
console.log(output.dims, cosine.toFixed(3)) // [2, 384]
