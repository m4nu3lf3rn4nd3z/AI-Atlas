# Recall frente a velocidad: búsqueda exacta, HNSW e IVF-PQ con FAISS.
import time

import faiss
import numpy as np

d, n, nq, k = 384, 200_000, 500, 10
rng = np.random.default_rng(0)
xb = rng.standard_normal((n, d)).astype("float32")
xq = rng.standard_normal((nq, d)).astype("float32")
faiss.normalize_L2(xb)
faiss.normalize_L2(xq)  # vectores normalizados: producto escalar = coseno


def run(index, name):
    t = time.perf_counter()
    _, ids = index.search(xq, k)
    ms = (time.perf_counter() - t) * 1000 / nq
    recall = np.mean([len(set(ids[i]) & set(truth[i])) / k for i in range(nq)])
    print(f"{name:<22} recall@{k} = {recall:.3f}   {ms:.3f} ms/consulta")


flat = faiss.IndexFlatIP(d)  # exacta
flat.add(xb)
_, truth = flat.search(xq, k)
run(flat, "Exacta")

hnsw = faiss.IndexHNSWFlat(d, 32, faiss.METRIC_INNER_PRODUCT)  # M = 32
hnsw.hnsw.efConstruction = 128
hnsw.add(xb)
for ef in (16, 64, 256):
    hnsw.hnsw.efSearch = ef  # el mando de recall frente a latencia
    run(hnsw, f"HNSW ef_search={ef}")

ivfpq = faiss.IndexIVFPQ(faiss.IndexFlatIP(d), d, 1024, 48, 8, faiss.METRIC_INNER_PRODUCT)  # 48 bytes por vector
ivfpq.train(xb[:50_000])
ivfpq.add(xb)
for nprobe in (8, 64):
    ivfpq.nprobe = nprobe
    run(ivfpq, f"IVF-PQ nprobe={nprobe}")
