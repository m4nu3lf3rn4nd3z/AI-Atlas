# Chroma embebido: una base vectorial en un directorio local, ideal para prototipos.
import chromadb

client = chromadb.PersistentClient(path="./chroma")
kb = client.get_or_create_collection("kb")

# Sin embeddings explícitos, Chroma usa su modelo por defecto (en inglés).
# Para español, pásale tus propios vectores con embeddings=[...].
kb.add(
    ids=["dev-1", "env-1"],
    documents=["Las devoluciones se aceptan durante 14 días.", "Los envíos a Canarias tardan de 5 a 7 días."],
    metadatas=[{"section": "Devoluciones"}, {"section": "Envíos"}],
)

res = kb.query(query_texts=["¿Cuánto tarda un envío a Tenerife?"], n_results=1, where={"section": "Envíos"})
print(res["documents"][0], res["distances"][0])
