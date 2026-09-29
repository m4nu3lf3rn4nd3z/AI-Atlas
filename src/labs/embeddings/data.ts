/* Sentences for the embeddings lab. Pure data: scripts/gen-embeddings.mjs
   imports this file directly to precompute the vectors. */

export interface SentenceGroup {
  id: string
  label: string
}

export const GROUPS: readonly SentenceGroup[] = [
  { id: 'pets', label: 'Mascotas' },
  { id: 'money', label: 'Dinero' },
  { id: 'weather', label: 'Tiempo' },
  { id: 'code', label: 'Programación' },
  { id: 'food', label: 'Comida' },
  { id: 'tricky', label: 'Casos trampa' },
]

export interface Sentence {
  text: string
  /** Label for the map. */
  short: string
  group: string
  /** Why this sentence is interesting. */
  note?: string
}

export const SENTENCES: readonly Sentence[] = [
  { text: 'El gato duerme en el sofá.', short: 'gato en el sofá', group: 'pets' },
  { text: 'Mi perro se pone nervioso cuando hay tormenta.', short: 'perro y tormenta', group: 'pets' },
  { text: 'Hay que vacunar al cachorro antes de sacarlo a la calle.', short: 'vacunar al cachorro', group: 'pets' },
  {
    text: 'The cat is sleeping on the couch.',
    short: 'cat on the couch',
    group: 'pets',
    note: 'La misma idea que «El gato duerme en el sofá», en inglés.',
  },
  { text: 'Abrí una cuenta de ahorro en el banco.', short: 'cuenta en el banco', group: 'money' },
  { text: 'La hipoteca a tipo fijo protege de las subidas del euríbor.', short: 'hipoteca fija', group: 'money' },
  { text: 'Ayer transferí el dinero del alquiler.', short: 'pagar el alquiler', group: 'money' },
  { text: 'Mañana lloverá en todo el norte.', short: 'lluvia mañana', group: 'weather' },
  { text: 'Hace un calor insoportable esta tarde.', short: 'calor insoportable', group: 'weather' },
  { text: 'Se esperan nevadas por encima de los 800 metros.', short: 'nevadas', group: 'weather' },
  { text: 'El test falla porque la variable llega nula.', short: 'test que falla', group: 'code' },
  { text: 'Hay que desplegar la nueva versión de la API.', short: 'desplegar la API', group: 'code' },
  { text: 'Este bucle recorre la lista dos veces.', short: 'bucle doble', group: 'code' },
  { text: 'Para la tortilla, bate los huevos con una pizca de sal.', short: 'tortilla', group: 'food' },
  { text: 'El arroz se pasa si lo dejas más de veinte minutos.', short: 'arroz pasado', group: 'food' },
  { text: 'Me encanta este restaurante.', short: 'me encanta el restaurante', group: 'food' },
  {
    text: 'Me senté a leer en un banco del parque.',
    short: 'banco del parque',
    group: 'tricky',
    note: '«Banco» con otro significado: ¿se acerca a las frases de dinero?',
  },
  {
    text: 'No me gusta nada este restaurante.',
    short: 'no me gusta el restaurante',
    group: 'tricky',
    note: 'Lo contrario de «Me encanta este restaurante», con casi las mismas palabras.',
  },
  { text: 'El banco central subió los tipos de interés.', short: 'banco central', group: 'money' },
  { text: 'Python es un lenguaje de programación.', short: 'Python', group: 'code' },
]

/** Pairs worth comparing in the similarity matrix. */
export const MATRIX: readonly string[] = [
  'El gato duerme en el sofá.',
  'The cat is sleeping on the couch.',
  'Mi perro se pone nervioso cuando hay tormenta.',
  'Me encanta este restaurante.',
  'No me gusta nada este restaurante.',
  'Abrí una cuenta de ahorro en el banco.',
  'Me senté a leer en un banco del parque.',
  'Hace un calor insoportable esta tarde.',
]

/** Queries with precomputed embeddings, usable without downloading the model. */
export const QUERIES: readonly string[] = [
  'Mi mascota tiene miedo de los truenos',
  '¿Va a hacer frío la semana que viene?',
  'Préstamo para comprarme un piso',
  'Receta con huevos',
  'Un sitio para sentarse al aire libre',
  'Error en el código',
]

/** multilingual-e5 expects a task prefix: "query: " for queries and symmetric similarity. */
export const E5_QUERY = 'query: '
export const E5_PASSAGE = 'passage: '
