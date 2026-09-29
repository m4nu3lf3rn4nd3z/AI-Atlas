# Chunking recursivo y por estructura con LangChain, midiendo el tamaño en tokens.
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

doc = open("politica_vacaciones.md", encoding="utf-8").read()

# 1. Recursivo: párrafo → línea → frase → palabra, con el tamaño medido en tokens
recursive = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="o200k_base",
    chunk_size=400,
    chunk_overlap=0,
)
chunks = recursive.split_text(doc)
print(len(chunks), "fragmentos")

# 2. Por estructura: una sección por encabezado, con la ruta de títulos como metadatos
by_headers = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "documento"), ("##", "seccion")],
    strip_headers=False,
)
sections = by_headers.split_text(doc)

# Las secciones demasiado largas se vuelven a dividir de forma recursiva
final = recursive.split_documents(sections)
for c in final[:3]:
    ruta = " › ".join(v for k, v in c.metadata.items() if k in ("documento", "seccion"))
    texto_indexado = f"{ruta}\n{c.page_content}"  # el título da contexto al fragmento
    print(texto_indexado[:120], "…")
