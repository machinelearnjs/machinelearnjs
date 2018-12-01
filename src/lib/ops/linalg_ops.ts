import * as tf from '@tensorflow/tfjs';
import { solve } from './linalg_solve';

/**
 *
 * @param m matrix whose svd is to be computed
 * @returns
 *  `u`: orthogonal matrix
 *
 *  `s`: diagonal matrix
 *
 *  `v`: orthogonal matrix
 *
 * such that `m = u*s*v`
 *
 */
export function svd(
  m: tf.Tensor2D
): { u: tf.Tensor; s: tf.Tensor; v: tf.Tensor } {
  const mT = m.dot(transpose(m));
  const u = eingen(mT).vectors;
  // transform a tensor1d to a diagonal matrix
  // where the tensor1d elements are in the diagonal
  const s = tf
    .concat(
      tf.unstack(eingen(mT).values).reduce((a, b, i, ar) => {
        const row = Array.from(
          { length: ar.length },
          (e, index) => (index === i ? sqrt(b.as1D()) : tensor1d([0]))
        );
        a.push(...row);
        return a;
      }, [])
    )
    .reshape(m.shape);
  const v: Tensor2D = solve(
    u.dot(s) as tf.Tensor2D,
    m as tf.Tensor2D
  ) as tf.Tensor2D;
  return { u, s, v };
}

/**
 * The algorithm used is the QR decomposition
 *
 * Implementation based on:
 * [http://www.math.tamu.edu/~dallen/linear_algebra/chpt6.pdf]
 * (http://www.math.tamu.edu/~dallen/linear_algebra/chpt6.pdf):
 *
 *   - `A0 = Q0 * R0`
 *   - `A1 = R0 * Q0 = Q1 * R1`
 *   - `A2 = R1 * Q1 = Q2 * R2`
 *   -  .  = .  * .  = .  * .
 *   -  .  = .  * .  = .  * .
 *   -  .  = .  * .  = .  * .
 *   - `An = Rn * Qn = Qn * Rn`
 *
 *   `An` tends to a diagonal matrix where the diagonal values are the
 * eingen values of A.
 *
 *    Π(Q0, Q1, ..., Qn) gives the eigen vectors associated to the eigen values
 *
 * @param m matrix whose eigen values and vectors are to compute
 * @returns
 * {values: eigen values as Tensor1D, vectors: eigen vectors as Tensor}
 */
export function eingen(
  m: tf.Tensor
): { values: tf.Tensor1D; vectors: tf.Tensor } {
  let z;
  for (let i = 0; i < 5; i++) {
    const [x, y] = tf.linalg.qr(m);
    m = y.dot(x);
    z = z ? z.dot(x) : x;
    y.dispose();
  }
  return { values: diagonalElements(m), vectors: z };
}

function diagonalElements(m: tf.Tensor): tf.Tensor1D {
  const ei: tf.Tensor1D[] = [];
  for (let i = 0; i < m.shape[0]; i++) {
    ei.push(m.slice([i, i], [1, 1]).as1D());
  }
  return tf.concat(ei);
}
