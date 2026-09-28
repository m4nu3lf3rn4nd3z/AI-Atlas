// npm i @huggingface/transformers
// Embeddings en Node o en el navegador, sin servidor: el modelo (~120 MB) se descarga una vez.
import { cos_sim, pipeline } from '@huggingface/transformers'

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
)

const frases = ['¿Cómo reinicio el router?', 'Pasos para resetear el módem de casa', 'Receta de tortilla']

// mean pooling: media de los vectores de todos los tokens → un vector por frase
const output = await extractor(frases, { pooling: 'mean', normalize: true })
const [a, b, c] = output.tolist() as number[][]

console.log('router vs módem   ', cos_sim(a!, b!).toFixed(3))
console.log('router vs tortilla', cos_sim(a!, c!).toFixed(3))
