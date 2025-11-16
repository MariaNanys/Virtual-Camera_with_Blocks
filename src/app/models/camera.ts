import {Point3D} from './point3d';
import {Matrix4x4} from './matrix4x4';

export class Camera {
  public transformMatrix: Matrix4x4;
  public position: Point3D;
  public zoom: number;

  constructor(position: Point3D, zoom: number = 1.0) {
    this.position = position;
    this.zoom = zoom;
    this.transformMatrix = new Matrix4x4();
  }

  project(point: Point3D, canvasSize: number) {
    const transformedPoint = Matrix4x4.multiplyPoint(this.transformMatrix, point);

    const x_c = transformedPoint.x;
    const y_c = transformedPoint.y;
    const z_c = transformedPoint.z;

    const near = 1.0;
    if (z_c <= near) {
      return {x: -1, y: -1, z: z_c, isBehind: true};
    }

    const focal = 500;
    const scale = this.zoom * focal / z_c;

    const x = x_c * scale + canvasSize / 2;
    const y = -y_c * scale + canvasSize / 2;

    return {x, y, z: z_c, isBehind: false};
  }
}
