import {Point3D} from './point3d';
import {Vector3D} from './vector3d';

export class Polygon3D {
  constructor(public vertices: Point3D[], public color: string) {
  }

  getCenter(): Point3D {
    let x = 0, y = 0, z = 0;
    for (const v of this.vertices) {
      x += v.x;
      y += v.y;
      z += v.z;
    }
    const n = this.vertices.length || 1;
    return new Point3D(x / n, y / n, z / n);
  }

  getNormal(): Vector3D {
    if (this.vertices.length < 3) return new Vector3D(0, 0, 0);
    const v1 = Vector3D.subtract(this.vertices[1], this.vertices[0]);
    const v2 = Vector3D.subtract(this.vertices[2], this.vertices[0]);
    return Vector3D.crossProduct(v1, v2).normalize();
  }
}
