// Simple Sinkhorn implementation (JS)
export function sinkhorn(costMatrix, a, b, eps = 0.1, maxIter = 200) {
  const n = costMatrix.length;
  const m = costMatrix[0].length;
  // K = exp(-C / eps)
  const K = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => Math.exp(-costMatrix[i][j] / eps))
  );
  let u = Array(n).fill(1.0);
  let v = Array(m).fill(1.0);
  for (let it = 0; it < maxIter; it++) {
    // v = b / (K^T u)
    const KTu = Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) KTu[j] += K[i][j] * u[i];
    }
    for (let j = 0; j < m; j++) v[j] = b[j] / (KTu[j] + 1e-12);
    const Kv = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) Kv[i] += K[i][j] * v[j];
    }
    for (let i = 0; i < n; i++) u[i] = a[i] / (Kv[i] + 1e-12);
  }
  // transport P = diag(u) K diag(v)
  const P = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => u[i] * K[i][j] * v[j])
  );
  return { P };
}
