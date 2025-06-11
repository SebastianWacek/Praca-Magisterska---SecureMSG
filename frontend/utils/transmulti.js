// Filtry Ht (4 kanały)
export const Ht = [
  [3, 1, 6, 2],
  [2, 5, 3, 6],
  [5, 1, 2, 6],
  [6, 6, 3, 2],
];

// Filtry Hd (4 kanały)
export const Hd = [
  [-0.0380859375,  0.2011718750, -0.06640625,  -0.0214843750],
  [ 0.1113281250,  0.0273437500,  0.11718750,  -0.1679687500],
  [ 0.1025390625, -0.0800781250, -0.12890625,   0.1347656250],
  [-0.1035156250, -0.0429687500,  0.10156250,   0.1210937500],
];

// Konwolucja sygnału z wektorem coeffs
function convolution(signal, coeffs) {
  const n = signal.length;
  const m = coeffs.length;
  const result = new Array(n + m - 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      result[i + j] += signal[i] * coeffs[j];
    }
  }
  return result;
}

// Konwersja tekstu do wektora kodów ASCII/Unicode
function textToSignal(text) {
  const res = [];
  for (let i = 0; i < text.length; i++) {
    res.push(text.charCodeAt(i));
  }
  return res;
}

// Upsampling M=4: wstaw 3 zera między próbki
function insertZeros(signal, M) {
  const res = [];
  for (let v of signal) {
    res.push(v);
    for (let k = 1; k < M; k++) res.push(0);
  }
  return res;
}

// Pad listy do tej samej długości
function padSignals(signals) {
  const maxLen = Math.max(...signals.map((s) => s.length));
  return signals.map((s) => {
    const copy = s.slice();
    while (copy.length < maxLen) copy.push(0);
    return copy;
  });
}

// Szyfrowanie jednego tekstu w 4-kanałach
export function encryptText(text) {
  const M = 4;
  const s1 = textToSignal(text);
  const s2 = [];
  const s3 = [];
  const s4 = [];
  const channels = [s1, s2, s3, s4];

  const upsampled = channels.map((ch) => insertZeros(ch, M));
  const convolved = upsampled.map((up, idx) => convolution(up, Ht[idx]));
  const padded = padSignals(convolved);

  const length = padded[0].length;
  const encrypted = new Array(length).fill(0);
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < 4; c++) {
      encrypted[i] += padded[c][i];
    }
  }
  return encrypted;
}

// Deszyfrowanie: przywracamy oryginalny tekst z kanału 0
export function decryptSignal(encrypted) {
  const M = 4;
  const decoded = [];
  for (let offset = 0; offset < 4; offset++) {
    const hd = Hd[offset];
    const y = convolution(encrypted, hd);
    const start = hd.length - 1 + offset;
    const dec = [];
    for (let i = start; i < y.length; i += M) dec.push(y[i]);
    decoded.push(dec);
  }
  const chan0 = decoded[0];
  let text = "";
  for (let v of chan0) {
    const c = Math.round(v);
    if (c > 0 && c < 0x110000) text += String.fromCharCode(c);
  }
  return text;
}