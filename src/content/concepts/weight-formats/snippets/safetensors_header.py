# Leer la cabecera de un safetensors remoto sin descargar el modelo (peticiones HTTP de rango).
import json
import struct

import requests

url = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/resolve/main/model.safetensors"


def read_range(start: int, end: int) -> bytes:
    r = requests.get(url, headers={"Range": f"bytes={start}-{end}"}, timeout=30)
    r.raise_for_status()
    return r.content


# Formato: 8 bytes (u64, little-endian) con la longitud de la cabecera + cabecera JSON + datos
(header_len,) = struct.unpack("<Q", read_range(0, 7))
header = json.loads(read_range(8, 8 + header_len - 1))
header.pop("__metadata__", None)

print(len(header), "tensores")
for name in list(header)[:5]:
    t = header[name]
    print(f"{name:<45} {t['dtype']:<5} {t['shape']}  bytes {t['data_offsets']}")
total = sum(v["data_offsets"][1] - v["data_offsets"][0] for v in header.values())
print(f"pesos: {total / 2**30:.2f} GiB")
