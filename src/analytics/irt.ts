/**
 * Item response theory — 2PL with a fixed guessing floor (memo D6, pivot §4;
 * PM ruling RT-22a, 2026-08-07).
 *
 * WHY THIS EXISTS RATHER THAN BEING THE NEXT CHART. Classical test theory gave
 * us two numbers that both turned out to be contaminated:
 *  - item difficulty p is POPULATION-DEPENDENT — the same item is "easier" in
 *    an abler cohort, so p describes a cohort-item pair, not an item;
 *  - the point-biserial is attenuated by the unreliability of the rest-score it
 *    is measured against, badly enough that 0/6 items cleared the §1 floor at
 *    the live pool's length.
 * IRT estimates `a` and `b` directly, on a scale defined by the ability
 * distribution rather than by whoever happened to sit the test. That is the
 * measurement fix for RT-21, as opposed to moving a threshold until the
 * answers look better.
 *
 * THE MODEL: P(correct | θ) = c + (1 − c)·σ(a(θ − b)), with c FIXED at chance.
 * A two-alternative task cannot score below 50% in expectation, so the floor is
 * known rather than estimated — estimating a parameter we already know would
 * only add variance and create the classic 3PL identification headaches.
 *
 * THE METHOD: marginal maximum likelihood via EM over a fixed quadrature grid
 * for θ ~ N(0,1). The E-step computes each respondent's posterior over the
 * grid; the M-step maximises each item's expected log-likelihood by
 * Newton-Raphson on (a, b). Person abilities come out afterwards as EAP
 * (posterior mean) estimates.
 *
 * IDENTIFICATION: the θ scale is fixed by the N(0,1) prior. `a` and `b` are
 * therefore in that metric and are NOT comparable across fits with different
 * priors — a caveat that matters the moment two cohorts are compared.
 *
 * HONESTY (N3): IRT assumes unidimensionality, local independence, and that the
 * logistic form is right. None of those are verified here, and none can be at
 * n = 0. Recovering parameters from data this model generated proves the
 * ESTIMATOR, not the model's fit to real listeners.
 */

import type { ResponseMatrix, DataSource } from "./estimate";

/** Guessing floor for a 2AFC item. Fixed, not estimated — see header. */
export const IRT_GUESS = 0.5;

/** Bounds keep Newton steps from wandering into regions the data cannot support. */
const A_MIN = 0.05;
const A_MAX = 4;
const B_ABS_MAX = 6;

export interface IrtItem {
  id: string;
  /** Discrimination — the slope. Higher = separates ability more sharply. */
  a: number;
  /** Difficulty on the θ scale: the ability at which P is halfway above chance. */
  b: number;
  /**
   * True when a parameter finished pinned against its bound. That is NOT an
   * estimate — it is the optimiser reporting that the data do not locate the
   * parameter, and the bound is the only thing stopping it running away.
   * Consumers must refuse to use such a value rather than read the clamp as a
   * measurement.
   *
   * Measured 2026-08-08 on the live 6-trial pool: three of six items pinned at
   * a = 4 with 100 respondents, and one still pinned at 500, against a true a
   * of 1.0 throughout. A six-item test cannot identify 2PL parameters — each
   * person's ability rests on six binary answers with a 50% guessing floor,
   * and the item parameters inherit that noise.
   */
  atBound: boolean;
}

export interface IrtFit {
  dataSource: DataSource;
  items: IrtItem[];
  /** EAP ability estimate per respondent, in matrix order. */
  theta: number[];
  /** EM iterations actually run. */
  iterations: number;
  /** True when EM hit the iteration cap instead of the tolerance. */
  hitIterationCap: boolean;
  /** Marginal log-likelihood at the final step — for comparing fits. */
  logLikelihood: number;
  /**
   * Set when the fit should not be trusted as a whole — currently when any
   * item pinned at a bound. Rendering bound-pinned parameters as if they were
   * measurements is exactly the fabrication N3 exists to prevent.
   */
  warning: string | null;
}

export interface IrtOptions {
  /** Quadrature nodes across the ability range. */
  nNodes?: number;
  nodeSpan?: number;
  maxIterations?: number;
  /** EM stops when the largest parameter change falls below this. */
  tolerance?: number;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** P(correct) under the model. Exported so recovery can compute known truth. */
export function irtProbability(item: Pick<IrtItem, "a" | "b">, theta: number): number {
  return IRT_GUESS + (1 - IRT_GUESS) * sigmoid(item.a * (theta - item.b));
}

/** Gauss-style grid with normal weights. Simple, deterministic, adequate at this scale. */
function quadrature(nNodes: number, span: number) {
  const nodes: number[] = [];
  const weights: number[] = [];
  const step = (2 * span) / (nNodes - 1);
  let total = 0;
  for (let i = 0; i < nNodes; i++) {
    const t = -span + i * step;
    const w = Math.exp(-0.5 * t * t);
    nodes.push(t);
    weights.push(w);
    total += w;
  }
  return { nodes, weights: weights.map((w) => w / total) };
}

/**
 * One item's M-step: maximise the expected log-likelihood over (a, b) given
 * expected attempt/correct counts per quadrature node.
 *
 * Newton-Raphson with an analytic gradient and a finite-difference Hessian.
 * Two parameters make the Hessian cheap, and the damping plus bounds keep a
 * badly-conditioned item (one everyone answers alike) from throwing the fit.
 */
function maximiseItem(a0: number, b0: number, nodes: number[], nk: number[], rk: number[]): { a: number; b: number } {
  let a = a0;
  let b = b0;

  const grad = (aa: number, bb: number) => {
    let ga = 0;
    let gb = 0;
    for (let k = 0; k < nodes.length; k++) {
      if (nk[k] <= 0) continue;
      const z = aa * (nodes[k] - bb);
      const s = sigmoid(z);
      const p = IRT_GUESS + (1 - IRT_GUESS) * s;
      const denom = p * (1 - p);
      if (denom < 1e-12) continue;
      // d(logL)/dz, common to both parameters.
      const common = ((rk[k] - nk[k] * p) / denom) * (1 - IRT_GUESS) * s * (1 - s);
      ga += common * (nodes[k] - bb);
      gb += common * -aa;
    }
    return [ga, gb];
  };

  for (let step = 0; step < 30; step++) {
    const [ga, gb] = grad(a, b);
    if (Math.abs(ga) < 1e-7 && Math.abs(gb) < 1e-7) break;

    // Finite-difference Hessian.
    const h = 1e-5;
    const [gaa, gba] = grad(a + h, b);
    const [gab, gbb] = grad(a, b + h);
    const h11 = (gaa - ga) / h;
    const h12 = (gab - ga) / h;
    const h21 = (gba - gb) / h;
    const h22 = (gbb - gb) / h;
    const det = h11 * h22 - h12 * h21;

    let da: number;
    let db: number;
    if (Math.abs(det) < 1e-10) {
      // Singular — fall back to a small gradient step rather than exploding.
      da = 0.01 * ga;
      db = 0.01 * gb;
    } else {
      da = -(h22 * ga - h12 * gb) / det;
      db = -(-h21 * ga + h11 * gb) / det;
    }
    // Damping: Newton on a ragged likelihood can overshoot spectacularly.
    const scale = Math.min(1, 0.5 / Math.max(Math.abs(da), Math.abs(db), 1e-9));
    a = clamp(a + da * scale, A_MIN, A_MAX);
    b = clamp(b + db * scale, -B_ABS_MAX, B_ABS_MAX);
  }
  return { a, b };
}

export function fitIrt(matrix: ResponseMatrix, options: IrtOptions = {}): IrtFit {
  const { nNodes = 41, nodeSpan = 4, maxIterations = 200, tolerance = 1e-4 } = options;
  const { correct, itemIds } = matrix;
  const nPersons = correct.length;
  const nItems = itemIds.length;
  if (nPersons === 0) throw new Error("irt: empty matrix");
  if (nItems < 2) throw new Error("irt: at least 2 items are required to identify the scale");

  const { nodes, weights } = quadrature(nNodes, nodeSpan);

  // Start from a crude but sane place: difficulty from the observed p-value,
  // discrimination at 1. Bad starts cost iterations; wild starts cost fits.
  const items: IrtItem[] = itemIds.map((id, j) => {
    const p = correct.reduce((s, row) => s + (row[j] ? 1 : 0), 0) / nPersons;
    const above = clamp((p - IRT_GUESS) / (1 - IRT_GUESS), 0.02, 0.98);
    return { id, a: 1, b: clamp(-Math.log(above / (1 - above)), -3, 3), atBound: false };
  });

  let iterations = 0;
  let logLikelihood = -Infinity;
  let hitIterationCap = true;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;

    // ---- E-step: expected counts per item per node.
    const nk = items.map(() => new Float64Array(nNodes));
    const rk = items.map(() => new Float64Array(nNodes));
    // P is the same for every respondent, so build it once per iteration.
    const pjk = items.map((item) => nodes.map((t) => irtProbability(item, t)));
    logLikelihood = 0;

    for (let i = 0; i < nPersons; i++) {
      const row = correct[i];
      // Log-space likelihood over nodes: with many items, products underflow.
      const logL = new Float64Array(nNodes);
      for (let k = 0; k < nNodes; k++) {
        let acc = Math.log(weights[k]);
        for (let j = 0; j < nItems; j++) {
          const p = pjk[j][k];
          acc += row[j] ? Math.log(p) : Math.log(1 - p);
        }
        logL[k] = acc;
      }
      let maxLog = -Infinity;
      for (let k = 0; k < nNodes; k++) if (logL[k] > maxLog) maxLog = logL[k];
      let sum = 0;
      for (let k = 0; k < nNodes; k++) sum += Math.exp(logL[k] - maxLog);
      logLikelihood += maxLog + Math.log(sum);

      for (let k = 0; k < nNodes; k++) {
        const post = Math.exp(logL[k] - maxLog) / sum;
        if (post < 1e-12) continue;
        for (let j = 0; j < nItems; j++) {
          nk[j][k] += post;
          if (row[j]) rk[j][k] += post;
        }
      }
    }

    // ---- M-step: one independent 2-parameter maximisation per item.
    let biggestChange = 0;
    for (let j = 0; j < nItems; j++) {
      const before = items[j];
      const next = maximiseItem(before.a, before.b, nodes, Array.from(nk[j]), Array.from(rk[j]));
      biggestChange = Math.max(biggestChange, Math.abs(next.a - before.a), Math.abs(next.b - before.b));
      const atBound =
        next.a <= A_MIN + 1e-6 ||
        next.a >= A_MAX - 1e-6 ||
        Math.abs(next.b) >= B_ABS_MAX - 1e-6;
      items[j] = { id: before.id, ...next, atBound };
    }
    if (biggestChange < tolerance) {
      hitIterationCap = false;
      break;
    }
  }

  // ---- EAP abilities under the final item parameters.
  const pjk = items.map((item) => nodes.map((t) => irtProbability(item, t)));
  const theta = correct.map((row) => {
    const logL = new Float64Array(nNodes);
    for (let k = 0; k < nNodes; k++) {
      let acc = Math.log(weights[k]);
      for (let j = 0; j < nItems; j++) acc += row[j] ? Math.log(pjk[j][k]) : Math.log(1 - pjk[j][k]);
      logL[k] = acc;
    }
    let maxLog = -Infinity;
    for (let k = 0; k < nNodes; k++) if (logL[k] > maxLog) maxLog = logL[k];
    let sum = 0;
    let weighted = 0;
    for (let k = 0; k < nNodes; k++) {
      const w = Math.exp(logL[k] - maxLog);
      sum += w;
      weighted += w * nodes[k];
    }
    return weighted / sum;
  });

  const pinned = items.filter((i) => i.atBound);
  const warning =
    pinned.length > 0
      ? `${pinned.length} of ${nItems} items finished pinned at a parameter bound (${pinned
          .map((i) => i.id)
          .join(", ")}). Those values are not estimates — the data do not locate the parameter. ` +
        `With ${nItems} items and ${nPersons} respondents the test is very likely too SHORT to identify 2PL parameters; lengthen it before reading these numbers.`
      : null;

  return { dataSource: matrix.dataSource, items, theta, iterations, hitIterationCap, logLikelihood, warning };
}

/**
 * IRT discrimination per item id, for feeding the Layer B gate (RT-23a).
 *
 * Bound-pinned items are EXCLUDED rather than returned with their clamp value.
 * A parameter sitting on its bound is not an estimate — the gate falls back to
 * the point-biserial for those items, which is the honest ordering: a
 * contaminated measurement beats a fabricated one.
 */
export function irtDiscriminationById(fit: IrtFit): Map<string, number> {
  const out = new Map<string, number>();
  for (const item of fit.items) if (!item.atBound) out.set(item.id, item.a);
  return out;
}
