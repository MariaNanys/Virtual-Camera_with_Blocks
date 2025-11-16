import {Point3D} from "./point3d";

export class Vector3D {

  constructor(public x: number, public y: number, public z: number) {
  }

  static subtract(p1: Point3D, p2: Point3D): Vector3D {
    return new Vector3D(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
  }

  static crossProduct(v1: Vector3D, v2: Vector3D): Vector3D {
    return new Vector3D(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  static dotProduct(v1: Point3D | Vector3D, v2: Point3D | Vector3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  normalize(): Vector3D {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return new Vector3D(this.x / length, this.y / length, this.z / length);
  }
}
