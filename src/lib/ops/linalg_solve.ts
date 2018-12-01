import * as tf from '@tensorflow/tfjs';

function assert(expr: boolean, msg: string | (() => string)) {
  if (!expr) {
    throw new Error(typeof msg === 'string' ? msg : msg());
  }
}

// helper to the solve equation
function solve_unique_equation(
  a: tf.Tensor2D,
  b: tf.Tensor2D,
  adjoint = false
): tf.Tensor2D {
  return ENV.engine.tidy(() => {
    const [r, c] = a.shape;
    const [r2, c2] = b.shape;
    assert(r === r2, 'Second dimension size does not match');
    if (adjoint) {
      a = adjM(a);
    }
    const { upperM, det } = gaussJordanTriangular(a, b);
    assert(det.dataSync()[0] !== 0, 'Input matrix is not inversible');
    const trian = tf.unstack(upperM);
    const len = trian.length;
    trian[len - 1] = trian[len - 1].div(
      trian[len - 1].slice(r - 1, 1).asScalar()
    );
    for (let i = r - 2; i > -1; i--) {
      for (let j = r - 1; j > i; j--) {
        trian[i] = trian[i].sub(trian[j].mul(trian[i].slice(j, 1).asScalar()));
      }
      trian[i] = trian[i].div(trian[i].slice(i, 1).asScalar());
    }
    return tf.split(tf.stack(trian), [c, c2], 1)[1] as tf.Tensor2D;
  });
}

/**
 *
 * @param a is a unique square matrix M or a tensor of shape `[..., M, M]` whose
 * inner-most 2 dimensions form square matrices
 * @param b is a unique matrix M or a tensor of shape `[..., M, M]`
 * @param adjoint is a boolean.
 * If adjoint is false then each output matrix satisfies `a * output = b`
 * (respectively `a[..., :, :] * output[..., :, :] = b[..., :, :]` if the inputs
 * are arrays of matrixes) . If adjoint is true then each output matrix
 * satisfies `adjoint(a) * output = b` (respectively `adjoint(a[..., :, :]) *
 * output[..., :, :] = b[..., :,
 * :]`).
 */
export function solve(
  a: tf.Tensor2D[] | tf.Tensor2D,
  b: tf.Tensor2D[] | tf.Tensor2D,
  adjoint = false
): tf.Tensor2D[] | tf.Tensor2D {
  if (Array.isArray(a) || Array.isArray(b)) {
    assert(
      (a as tf.Tensor2D[]).length === (b as tf.Tensor2D[]).length,
      'Second dimension size does not match'
    );
    const sol: tf.Tensor2D[] = [];
    (a as tf.Tensor2D[]).forEach((m, i) => {
      sol.push(solve_unique_equation(m, (b as tf.Tensor2D[])[i], adjoint));
    });
    return sol;
  } else {
    return solve_unique_equation(a, b, adjoint);
  }
}

/**
 *
 * @param a is a square matrix M (Tensor2d with shape `[r, c]` such that `r ===
 * c`)
 * @param b is a Tensor2d with shape `[r2, c2]`
 * @desc `r === r2`
 * @returns a matrix of shape `[r, c+c2]` after a [jordan-gauss
 * elimination](https://en.wikipedia.org/wiki/Gaussian_elimination) on the
 * matrix given by the concatenation `[a, b]`. The first r or c columns is an
 * upper triangular matrix
 */
function gaussJordanTriangular(
  a: tf.Tensor2D,
  b: tf.Tensor2D
): { upperM: tf.Tensor2D; det: tf.Scalar } {
  const [r, c] = a.shape;
  const [r2, c2] = b.shape;
  assert(r === r2, 'Second dimension size does not match');
  let inv: tf.Tensor = a.concat(b, 1);
  const rows = Array.from({ length: r }, (v, i) => i);
  let coef = tf.scalar(1);
  for (let i = 0; i < r; i++) {
    ({ inv, coef } = ENV.engine.tidy(() => {
      for (let j = i + 1; j < r; j++) {
        const elt = inv
          .slice([j, i], [1, 1])
          .as1D()
          .asScalar();
        const pivot = inv
          .slice([i, i], [1, 1])
          .as1D()
          .asScalar();
        if (elt.dataSync()[0] !== 0) {
          const factor = pivot.div(elt);
          coef = coef.mul(factor).mul(tf.scalar(-1));
          const newrow = inv
            .gather(tf.tensor1d([i], 'int32'))
            .sub(inv.gather(tf.tensor1d([j], 'int32')).mul(factor))
            .as1D();
          const sli = inv.gather(
            tf.tensor1d(rows.filter(e => e !== j), 'int32')
          );
          const arr: tf.Tensor[] = [];
          if (j === 0) {
            arr.push(newrow);
          }
          tf.unstack(sli).forEach((t, ind) => {
            if (ind !== j) {
              arr.push(t);
            } else {
              arr.push(newrow);
              arr.push(t);
            }
          });
          if (j === r - 1) {
            arr.push(newrow);
          }
          inv = tf.stack(arr);
        }
      }
      //  the first c colomns of inv is an upper triangular matrix
      return { inv, coef };
    }));
  }
  const determinant = diagonalMul(tf.split(inv, [c, c2], 1)[0] as tf.Tensor2D)
    .div(coef)
    .asScalar();
  return { upperM: inv as tf.Tensor2D, det: determinant };
}

/**
 *
 * @param m Tensor2d or matrix
 * @returns the product of the diagonal elements of @param m as a `tf.scalar`
 */
function diagonalMul(m: tf.Tensor2D): tf.Scalar {
  const [r, c] = m.shape;
  assert(r === c, 'Input is not a square matrix');
  let mul = m
    .slice([0, 0], [1, 1])
    .as1D()
    .asScalar();
  for (let i = 0; i < r; i++) {
    mul = m
      .slice([i, i], [1, 1])
      .as1D()
      .asScalar();
  }
  return mul;
}
