import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Análisis de imagen con Claude (visión)',
      lang: 'python',
      code: `import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

def analyze_image(image_path: str, question: str) -> str:
    """Analiza una imagen local con Claude."""
    path = Path(image_path)
    media_types = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp"}
    media_type = media_types.get(path.suffix.lower(), "image/jpeg")

    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": image_data},
                },
                {"type": "text", "text": question},
            ],
        }],
    )
    return response.content[0].text

def analyze_image_url(url: str, question: str) -> str:
    """Analiza una imagen por URL (sin descargarla)."""
    response = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "url", "url": url}},
                {"type": "text", "text": question},
            ],
        }],
    )
    return response.content[0].text

# Analizar una captura de pantalla con error
result = analyze_image(
    "screenshot_error.png",
    "¿Qué error muestra esta captura de pantalla y cómo se puede resolver?",
)
print(result)
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Claude admite imágenes hasta 20MB por archivo. Para PDFs de múltiples páginas, usa el tipo "document" en lugar de "image". El modelo Sonnet es suficiente para la mayoría de tareas de visión; reserva Opus para análisis muy complejos.',
    },
    {
      title: 'Transcripción de audio con Whisper',
      lang: 'python',
      code: `from openai import OpenAI
import anthropic

openai_client = OpenAI()
anthropic_client = anthropic.Anthropic()

def transcribe_and_analyze(audio_path: str, analysis_question: str) -> dict:
    """Transcribe audio y analiza el contenido con Claude."""
    # 1. Transcribir con Whisper
    with open(audio_path, "rb") as audio_file:
        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",  # Incluye timestamps y segmentos
            language="es",  # Especificar idioma mejora la precisión
        )

    transcript_text = transcription.text
    print(f"Transcripción ({len(transcript_text)} caracteres):")
    print(transcript_text[:200] + "...")

    # 2. Analizar con Claude
    response = anthropic_client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Transcripción de audio:\\n\\n{transcript_text}\\n\\n{analysis_question}",
        }],
    )

    return {
        "transcript": transcript_text,
        "analysis": response.content[0].text,
        "duration_seconds": transcription.duration,
    }

result = transcribe_and_analyze(
    "reunión.mp3",
    "¿Cuáles son los principales puntos de acción que se acordaron?",
)
`,
      deps: { openai: '>=1.40', anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Whisper-1 soporta 99 idiomas y es muy robusto con acentos y ruido. Para mayor precisión en español, usar `language="es"`. Los archivos de audio tienen límite de 25MB en la API de OpenAI.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la ventaja de usar un modelo multimodal para analizar PDFs en lugar de hacer OCR primero?',
      options: [
        'El modelo procesa el documento con toda su estructura visual (tablas, columnas, gráficos) sin perder información en la conversión a texto plano. Los OCR tradicionales a menudo pierden el formato de tablas o confunden columnas.',

        'El modelo multimodal es más rápido.',

        'Los modelos multimodales son gratuitos.',
        'Solo funcionan con PDFs.',
      ],
      answer: 0,
      explain:
        'El OCR convierte imágenes a texto pero pierde el contexto visual: una tabla puede convertirse en texto desordenado, una columna puede mezclarse con otra. Los modelos multimodales ven la estructura visual y pueden razonar sobre ella, lo que es crucial para documentos como facturas, contratos con tablas, o formularios.',
    },
    {
      q: '¿Por qué Whisper (speech-to-text) se combina frecuentemente con Claude en lugar de usar un modelo que procese audio nativo?',
      options: [
        'Porque Claude no puede procesar audio.',
        'Whisper es el modelo de transcripción más preciso y económico. Separar transcripción (Whisper) de razonamiento (Claude) permite usar el mejor modelo para cada tarea y controlar los costes.',
        'Porque los modelos de audio son muy lentos.',
        'Por requisitos regulatorios.',
      ],
      answer: 1,
      explain:
        'La transcripción (audio→texto) y el razonamiento sobre el contenido son dos capacidades distintas. Whisper es excelente y económico para transcripción. Claude es excelente para razonamiento sobre texto. Combinar los mejores modelos para cada tarea es una arquitectura práctica y eficiente.',
    },
    {
      q: '¿Cuál es la limitación más importante de los modelos de visión actuales?',
      options: [
        'No pueden procesar imágenes en color.',
        'Solo funcionan con imágenes de alta resolución.',

        'El conteo preciso de objetos, el razonamiento espacial 3D complejo, y el OCR en texto muy pequeño siguen siendo difíciles. Los modelos cometen errores que humanos no cometerían en estas tareas específicas.',

        'No pueden analizar documentos.',
      ],
      answer: 2,
      explain:
        'A pesar de ser muy capaces en comprensión general de imágenes, los modelos de visión tienen puntos ciegos conocidos: contar exactamente 37 objetos en una imagen, razonar sobre perspectivas 3D complejas, o leer texto muy pequeño o con fuentes poco comunes. Diseña sistemas que no dependan de estas capacidades para tareas críticas.',
    },
    {
      q: '¿Qué consideración de privacidad es especialmente importante cuando se usa visión con imágenes de usuarios?',
      options: [
        'El tamaño de las imágenes.',
        'Las imágenes enviadas a APIs externas pueden contener PII (rostros, documentos con datos personales, pantallas con información confidencial). Verificar la política de retención de datos del proveedor y considerar anonimización antes de enviar.',
        'La resolución de las imágenes.',
        'No hay consideraciones especiales para imágenes.',
      ],
      answer: 1,
      explain:
        'Una imagen de un documento escaneado puede contener nombre, DNI, dirección, datos bancarios. Una captura de pantalla puede contener emails o contraseñas. Antes de enviar imágenes a una API externa, verificar: ¿el proveedor retiene las imágenes? ¿con qué propósito? ¿por cuánto tiempo? Esto puede determinar si el caso de uso es legalmente viable bajo GDPR.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un modelo "multimodal" puede procesar cualquier tipo de dato (texto, imagen, audio, vídeo) de forma nativa.',
      reality:
        'Cada modelo tiene capacidades específicas. Claude puede procesar texto, imágenes y PDFs, pero no audio ni vídeo directamente. GPT-4o puede procesar audio. Gemini 1.5+ puede procesar vídeo. "Multimodal" no significa "omnisciente en todas las modalidades" — verifica las capacidades específicas del modelo antes de diseñar el sistema.',
    },
    {
      myth: 'Los modelos de visión pueden reemplazar a sistemas OCR especializados en todos los casos.',
      reality:
        'Para documentos simples con texto claro, los modelos de visión suelen ser mejores que el OCR tradicional. Para casos extremos (texto muy pequeño, calidad de imagen muy baja, idiomas con scripts no latinos, documentos con formato muy específico), los sistemas OCR especializados aún pueden ser superiores.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Vision documentation',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/vision',
      kind: 'docs',
    },
    {
      title: 'OpenAI · Whisper documentation',
      url: 'https://platform.openai.com/docs/guides/speech-to-text',
      kind: 'docs',
    },
  ],
}

export default details
