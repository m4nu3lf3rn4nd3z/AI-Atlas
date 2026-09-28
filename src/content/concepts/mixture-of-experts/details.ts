import type { ConceptDetails } from '../../schema'
import moeLayer from './snippets/moe_layer.py?raw'
import moeMemory from './snippets/moe_memory.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Una capa MoE con router top-k',
      lang: 'python',
      code: moeLayer,
      deps: { torch: '>=2.2' },
      verifiedAt: '2026-09',
      note: 'Versión didáctica: los modelos reales agrupan los tokens por experto con kernels especializados y añaden balanceo de carga.',
    },
    {
      title: 'Memoria vs cómputo de modelos MoE',
      lang: 'python',
      code: moeMemory,
      deps: {},
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Un modelo MoE tiene 235B parámetros totales y 22B activos. ¿Qué memoria necesitas para cargarlo (en FP16, sin contar el KV cache)?',
      options: [
        'La de 22B parámetros, unos 44 GB.',
        'La de 235B parámetros, unos 470 GB, porque todos los expertos deben estar en memoria.',
        'La media de ambos.',
        'Solo la del router.',
      ],
      answer: 1,
      explain:
        'Cualquier token puede necesitar cualquier experto, así que todos deben estar cargados. Los parámetros activos determinan el cómputo por token, no la memoria.',
    },
    {
      q: '¿Qué parte del bloque transformer sustituye normalmente MoE?',
      options: [
        'La capa de atención.',
        'La tabla de embeddings.',
        'La capa feed-forward (FFN), que pasa a ser un conjunto de expertos más un router.',
        'El tokenizador.',
      ],
      answer: 2,
      explain:
        'La atención se mantiene. La FFN, donde está gran parte de los parámetros, se reemplaza por varios expertos de los que solo se ejecutan unos pocos por token.',
    },
    {
      q: '¿Por qué los modelos MoE necesitan mecanismos de balanceo de carga?',
      options: [
        'Para que el router no mande casi todos los tokens a los mismos expertos y deje al resto sin entrenar.',
        'Para reducir el tamaño del vocabulario.',
        'Para poder usar temperatura 0.',
        'Para que todos los expertos se ejecuten siempre.',
      ],
      answer: 0,
      explain:
        'Sin incentivos, el router tiende a colapsar hacia unos pocos expertos favoritos. Se añaden penalizaciones o sesgos para repartir la carga y aprovechar toda la capacidad.',
    },
    {
      q: '¿Qué suelen mostrar los análisis sobre la especialización de los expertos?',
      options: [
        'Cada experto domina un tema humano (medicina, derecho, código…).',
        'Todos los expertos son idénticos.',
        'Solo un experto hace todo el trabajo.',
        'La especialización suele ser sintáctica o superficial, y rara vez corresponde a temas reconocibles.',
      ],
      answer: 3,
      explain:
        'El análisis de Mixtral, por ejemplo, no encontró especialización por dominio clara; el enrutado sigue más bien patrones de tokens y de sintaxis.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un MoE de 47B con 13B activos necesita la misma GPU que un modelo de 13B.',
      reality:
        'Necesita memoria para los 47B completos. Lo que se parece a un modelo de 13B es la velocidad de generación por token.',
    },
    {
      myth: '«8x7B» significa 8 modelos completos de 7B que votan.',
      reality:
        'Solo se multiplican las capas feed-forward; atención y embeddings son compartidos. Por eso Mixtral 8x7B suma unos 47B y no 56B.',
    },
    {
      myth: 'Los expertos son especialistas temáticos que se pueden elegir a mano.',
      reality:
        'El router aprende a repartir tokens según patrones internos que no corresponden a temas humanos, y no se controla desde el prompt.',
    },
  ],
  sources: [
    {
      title: 'Shazeer et al. (2017) · Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer',
      url: 'https://arxiv.org/abs/1701.06538',
      kind: 'paper',
    },
    {
      title: 'Fedus et al. (2021) · Switch Transformers',
      url: 'https://arxiv.org/abs/2101.03961',
      kind: 'paper',
    },
    { title: 'Jiang et al. (2024) · Mixtral of Experts', url: 'https://arxiv.org/abs/2401.04088', kind: 'paper' },
    {
      title: 'DeepSeek-AI (2024) · DeepSeek-V3 Technical Report',
      url: 'https://arxiv.org/abs/2412.19437',
      kind: 'paper',
    },
    {
      title: 'Hugging Face blog · Mixture of Experts Explained',
      url: 'https://huggingface.co/blog/moe',
      kind: 'blog',
    },
  ],
}

export default details
