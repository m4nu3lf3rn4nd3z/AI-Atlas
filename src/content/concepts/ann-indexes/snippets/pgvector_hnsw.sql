-- pgvector: índice HNSW sobre una columna de embeddings de 384 dimensiones
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunks (
  id        bigserial PRIMARY KEY,
  doc_id    text NOT NULL,
  content   text NOT NULL,
  embedding vector(384) NOT NULL
);

-- m: vecinos por nodo · ef_construction: esfuerzo al construir
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- ef_search: candidatos explorados por consulta (más recall, más latencia)
SET hnsw.ef_search = 100;

-- <=> es la distancia coseno: los 5 fragmentos más cercanos a la consulta ($1)
SELECT id, doc_id, content, 1 - (embedding <=> $1) AS similarity
FROM chunks
ORDER BY embedding <=> $1
LIMIT 5;
