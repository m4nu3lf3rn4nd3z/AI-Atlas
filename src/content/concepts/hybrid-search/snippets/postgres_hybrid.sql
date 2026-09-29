-- Búsqueda híbrida en PostgreSQL: texto completo en español + pgvector, fusionados con RRF.
-- $1 = embedding de la consulta, $2 = texto de la consulta.
-- Nota: ts_rank_cd no es BM25, pero cumple el mismo papel de ranking léxico.

CREATE INDEX ON chunks USING GIN (to_tsvector('spanish', content));

WITH semantic AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> $1) AS rank
  FROM chunks
  ORDER BY embedding <=> $1
  LIMIT 20
),
keyword AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(to_tsvector('spanish', content), query) DESC) AS rank
  FROM chunks, plainto_tsquery('spanish', $2) AS query
  WHERE to_tsvector('spanish', content) @@ query
  ORDER BY ts_rank_cd(to_tsvector('spanish', content), query) DESC
  LIMIT 20
)
SELECT COALESCE(semantic.id, keyword.id) AS id,
       COALESCE(1.0 / (60 + semantic.rank), 0.0) + COALESCE(1.0 / (60 + keyword.rank), 0.0) AS rrf_score
FROM semantic
FULL OUTER JOIN keyword ON semantic.id = keyword.id
ORDER BY rrf_score DESC
LIMIT 5;
