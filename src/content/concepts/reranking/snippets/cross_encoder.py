# Reordenar candidatos con un cross-encoder multilingüe y aplicar un umbral de relevancia.
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("BAAI/bge-reranker-v2-m3", max_length=512)

query = "¿Es obligatorio activar el doble factor?"
candidates = [  # p. ej., los 20–50 primeros de la búsqueda híbrida
    "El enlace para restablecer la contraseña caduca a los 30 minutos.",
    "Desde 2025, la verificación en dos pasos es obligatoria para las cuentas de administrador.",
    "Hay cuatro roles: Administrador, Operador, Finanzas y Solo lectura.",
]

ranked = reranker.rank(query, candidates, top_k=3, return_documents=True)
for r in ranked:
    print(f"{r['score']:.4f}  {r['text']}")

THRESHOLD = 0.01  # calibrado con tus preguntas; depende del modelo
context = [r["text"] for r in ranked if r["score"] >= THRESHOLD]
print(context or "Sin contexto relevante: el modelo debe responder que no lo sabe.")
