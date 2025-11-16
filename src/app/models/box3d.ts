import {Point3D} from './point3d';
import {Polygon3D} from './polygon3d';

export class Box3D {
  polygons: Polygon3D[] = [];

  constructor(x: number, y: number, z: number, w: number, h: number, d: number, color: string) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const cx = x + hw, cy = y + hh, cz = z + hd;

    const p1 = new Point3D(cx - hw, cy - hh, cz - hd);
    const p2 = new Point3D(cx + hw, cy - hh, cz - hd);
    const p3 = new Point3D(cx + hw, cy + hh, cz - hd);
    const p4 = new Point3D(cx - hw, cy + hh, cz - hd);
    const p5 = new Point3D(cx - hw, cy - hh, cz + hd);
    const p6 = new Point3D(cx + hw, cy - hh, cz + hd);
    const p7 = new Point3D(cx + hw, cy + hh, cz + hd);
    const p8 = new Point3D(cx - hw, cy + hh, cz + hd);

    this.polygons = [
      new Polygon3D([p1, p2, p3, p4], color),
      new Polygon3D([p5, p6, p7, p8], color),
      new Polygon3D([p1, p2, p6, p5], color),
      new Polygon3D([p4, p3, p7, p8], color),
      new Polygon3D([p1, p4, p8, p5], color),
      new Polygon3D([p2, p3, p7, p6], color),
    ];
  }
}
