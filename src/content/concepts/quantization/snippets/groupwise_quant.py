# Cuantización simétrica por redondeo con una escala por grupo: la idea detrás de
# Q4_0/Q8_0 (grupos de 32) y del almacenamiento de AWQ/GPTQ (grupos de 128).
import numpy as np


def quantize(w: np.ndarray, bits: int, group: int) -> np.ndarray:
    qmax = 2 ** (bits - 1) - 1
    g = w.reshape(-1, group)
    scale = np.abs(g).max(axis=1, keepdims=True) / qmax  # una escala FP16 por grupo
    q = np.clip(np.round(g / scale), -qmax - 1, qmax).astype(np.int8)  # lo que se guarda
    return (q * scale).reshape(w.shape)  # con lo que calcula el modelo


def snr_db(w: np.ndarray, w_hat: np.ndarray) -> float:
    return 10 * np.log10((w**2).sum() / ((w - w_hat) ** 2).sum())


rng = np.random.default_rng(0)
w = rng.normal(0, 0.02, size=4096).astype(np.float32)
w[70] = 0.6  # un outlier de 30σ

for group in (4096, 128, 32):  # 4096 = una sola escala para todo el tensor
    print(f"grupo {group:>4}: {snr_db(w, quantize(w, 4, group)):5.1f} dB")
# Con una sola escala el outlier estira la rejilla y la SNR se desploma;
# con grupos pequeños solo sufre el grupo del outlier.
