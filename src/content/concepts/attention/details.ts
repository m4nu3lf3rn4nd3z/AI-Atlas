import type { ConceptDetails } from '../../schema'
import attentionNumpy from './snippets/attention_numpy.py?raw'
import attentionTorch from './snippets/attention_torch.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Atención causal desde cero',
      lang: 'python',
      code: attentionNumpy,
      deps: { numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Una sola cabeza, sin optimizaciones: el objetivo es ver cada paso de la fórmula.',
    },
    {
      title: 'Manual vs scaled_dot_product_attention',
      lang: 'python',
      code: attentionTorch,
      deps: { torch: '>=2.2' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: '¿Por qué un LLM no puede "mirar" los tokens que vienen después del actual?',
      options: [
        'Porque la máscara causal pone a −∞ las puntuaciones de las posiciones futuras antes del softmax.',
        'Porque el tokenizador elimina los tokens futuros.',
        'Porque la FFN solo procesa el token actual.',
        'Porque RoPE solo codifica posiciones anteriores.',
      ],
      answer: 0,
      explain:
        'Tras el softmax, e^(−∞) = 0: las posiciones futuras reciben peso cero. Es imprescindible para entrenar prediciendo el siguiente token; si pudiera ver el futuro, haría trampa.',
    },
    {
      q: 'Duplicas la longitud del contexto. ¿Cómo crece el cómputo de las puntuaciones de atención?',
      options: [
        'Se mantiene igual.',
        'Se duplica.',
        'Aproximadamente se cuadruplica, porque cada token se compara con todos los anteriores.',
        'Crece de forma logarítmica.',
      ],
      answer: 2,
      explain:
        'La matriz de puntuaciones es n × n. Con 2n tokens tiene 4n² entradas. Por eso el contexto largo es caro y existen FlashAttention, las ventanas deslizantes y otras optimizaciones.',
    },
    {
      q: '¿Qué aporta tener muchas cabezas de atención en lugar de una sola grande?',
      options: [
        'Reduce el número total de parámetros a la mitad.',
        'Cada cabeza puede especializarse en un tipo de relación distinta (sintaxis, correferencia, posición…) en paralelo.',
        'Elimina la necesidad de la máscara causal.',
        'Permite procesar varios idiomas a la vez.',
      ],
      answer: 1,
      explain:
        'Una sola atención produce una única media ponderada por token. Varias cabezas producen varias medias con criterios distintos, que luego se combinan. Es una forma de capturar varias relaciones a la vez.',
    },
    {
      q: '¿Qué hace GQA (Grouped-Query Attention) y por qué se ha vuelto estándar?',
      options: [
        'Agrupa tokens para procesarlos más deprisa.',
        'Hace que la atención sea bidireccional.',
        'Sustituye la FFN por expertos.',
        'Hace que varias cabezas de query compartan keys y values, lo que reduce mucho el KV cache con poca pérdida de calidad.',
      ],
      answer: 3,
      explain:
        'Durante la generación hay que guardar las keys y values de todos los tokens previos. Si 8 cabezas de query comparten un único par K/V, esa memoria se divide por 8, lo que permite contextos más largos y más usuarios por GPU.',
    },
    {
      q: 'Sin información de posición (ni RoPE ni similares), ¿qué problema tendría la atención?',
      options: [
        'No podría calcular el softmax.',
        'Sería insensible al orden: «el perro mordió al hombre» y «el hombre mordió al perro» darían puntuaciones indistinguibles.',
        'Consumiría el doble de memoria.',
        'No podría usar la máscara causal.',
      ],
      answer: 1,
      explain:
        'El producto escalar q·k no depende de dónde está cada token. Las codificaciones posicionales (hoy casi siempre RoPE) inyectan el orden, de modo que la atención depende de la distancia relativa.',
    },
  ],
  misconceptions: [
    {
      myth: 'Los pesos de atención explican por qué el modelo ha dado su respuesta.',
      reality:
        'Son una pieza del cálculo, repartida entre decenas de capas y cabezas, y la FFN y las conexiones residuales también transportan información. Mirar una cabeza concreta puede ser sugerente, pero no es una explicación fiable del comportamiento.',
    },
    {
      myth: '«Atención» significa que el modelo se concentra como una persona.',
      reality:
        'Es una media ponderada de vectores con pesos calculados por productos escalares y un softmax. El nombre es una metáfora útil, nada más.',
    },
    {
      myth: 'Toda la inteligencia del modelo está en la atención.',
      reality:
        'La atención mueve información entre posiciones; las capas feed-forward, con alrededor de dos tercios de los parámetros, la transforman y almacenan buena parte de lo aprendido.',
    },
  ],
  sources: [
    {
      title: 'Vaswani et al. (2017) · Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      kind: 'paper',
    },
    {
      title: 'Jay Alammar · The Illustrated Transformer',
      url: 'https://jalammar.github.io/illustrated-transformer/',
      kind: 'blog',
    },
    {
      title: 'Su et al. (2021) · RoFormer: Rotary Position Embedding',
      url: 'https://arxiv.org/abs/2104.09864',
      kind: 'paper',
    },
    {
      title: 'Ainslie et al. (2023) · GQA: Grouped-Query Attention',
      url: 'https://arxiv.org/abs/2305.13245',
      kind: 'paper',
    },
    {
      title: 'Dao et al. (2022) · FlashAttention',
      url: 'https://arxiv.org/abs/2205.14135',
      kind: 'paper',
    },
    {
      title: "Andrej Karpathy · Let's build GPT: from scratch, in code, spelled out",
      url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
      kind: 'video',
    },
  ],
}

export default details
