import {Point3D} from './point3d';

export class Matrix4x4 {
  elements: number[];

  constructor() {
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static fromArray(arr: number[]): Matrix4x4 {
    const m = new Matrix4x4();
    m.elements = [...arr];
    return m;
  }

  static translation(x: number, y: number, z: number): Matrix4x4 {
    return Matrix4x4.fromArray([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    ]);
  }

  static multiplyMatrix(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
    const result = new Matrix4x4();
    const ae = a.elements;
    const be = b.elements;
    const re = result.elements;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        re[i * 4 + j] =
          ae[i * 4] * be[j] +
          ae[i * 4 + 1] * be[4 + j] +
          ae[i * 4 + 2] * be[2 * 4 + j] +
          ae[i * 4 + 3] * be[3 * 4 + j];
      }
    }
    return result;
  }

  static multiplyPoint(matrix: Matrix4x4, point: Point3D): Point3D {
    const m = matrix.elements;
    const x = point.x;
    const y = point.y;
    const z = point.z;

    const nx = m[0] * x + m[1] * y + m[2] * z + m[3];
    const ny = m[4] * x + m[5] * y + m[6] * z + m[7];
    const nz = m[8] * x + m[9] * y + m[10] * z + m[11];

    return new Point3D(nx, ny, nz);
  }

  transpose(): Matrix4x4 {
    const e = this.elements;
    return Matrix4x4.fromArray([
      e[0], e[4], e[8], e[12],
      e[1], e[5], e[9], e[13],
      e[2], e[6], e[10], e[14],
      e[3], e[7], e[11], e[15]
    ]);
  }
}
