# pip install sentence-transformers
from sentence_transformers import SentenceTransformer

# Modelo pequeño (384 dimensiones) y multilingüe: funciona bien en español
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

frases = [
    "¿Cómo reinicio el router?",
    "Pasos para resetear el módem de casa",
    "Receta de tortilla de patatas",
]
emb = model.encode(frases, normalize_embeddings=True)
print(emb.shape)  # (3, 384): un vector por frase

# Matriz de similitud coseno (con vectores normalizados = producto escalar)
print(model.similarity(emb, emb))
# Las dos primeras frases quedan muy cerca aunque no compartan palabras clave;
# la receta queda lejos de ambas.
