import math
from typing import List

def text_to_signal(text: str) -> List[int]:
    return [ord(c) for c in text]

def insert_zeros(signal: List[int], M: int) -> List[int]:
    res = []
    for v in signal:
        res.append(v)
        res.extend([0] * (M - 1))
    return res

def pad_signals(signals: List[List[float]]) -> List[List[float]]:
    max_len = max(len(s) for s in signals)
    return [s + [0]*(max_len - len(s)) for s in signals]

def convolution(signal: List[float], coeffs: List[float]) -> List[float]:
    n, m = len(signal), len(coeffs)
    out = [0.0] * (n + m - 1)
    for i, v in enumerate(signal):
        for j, c in enumerate(coeffs):
            out[i + j] += v * c
    return out

# Filtry szyfrujące Ht (4 kanały)
HT_FILTERS = [
    [3, 1, 6, 2],
    [2, 5, 3, 6],
    [5, 1, 2, 6],
    [6, 6, 3, 2],
]

# Filtry deszyfrujące Hd (4 kanały)
HD_FILTERS = [
    [-0.0380859375,  0.2011718750, -0.06640625,  -0.0214843750],
    [ 0.1113281250,  0.0273437500,  0.11718750,  -0.1679687500],
    [ 0.1025390625, -0.0800781250, -0.12890625,   0.1347656250],
    [-0.1035156250, -0.0429687500,  0.10156250,   0.1210937500],
]

def encrypt_text(text: str) -> List[int]:
    M = 4
    s1 = text_to_signal(text)
    s2 = []
    s3 = []
    s4 = []
    channels = [s1, s2, s3, s4]

    upsampled = [insert_zeros(channels[i], M) for i in range(4)]
    convs = [convolution(upsampled[i], HT_FILTERS[i]) for i in range(4)]
    convs = pad_signals(convs)
    encrypted = [int(sum(vals)) for vals in zip(*convs)]
    return encrypted

def decrypt_signal(encrypted: List[int]) -> str:
    M = 4
    decoded_channels = []
    for offset, hd in enumerate(HD_FILTERS):
        y = convolution(encrypted, hd)
        start = len(hd) - 1 + offset
        decimated = y[start::M]
        decoded_channels.append(decimated)
    chan0 = decoded_channels[0]
    text = "".join(
        chr(int(round(v))) for v in chan0 if 0 < round(v) < 0x110000
    )
    return text

# ————————————————————————————————————————————————
# Alias dla testów (pytest oczekuje dokładnie tych nazw):
encryptText = encrypt_text
decryptSignal = decrypt_signal