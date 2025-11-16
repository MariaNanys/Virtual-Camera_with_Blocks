import {Polygon3D} from './polygon3d';
import {Camera} from './camera';
import {Vector3D} from './vector3d';

export class BSPNode {
  public divider: Polygon3D | null = null;
  public front: BSPNode | null = null;
  public back: BSPNode | null = null;
  public polygons: Polygon3D[] = [];

  public static build(polygons: Polygon3D[]): BSPNode | null {
    if (polygons.length === 0) return null;
    return new BSPNode(polygons);
  }

  constructor(polygonList: Polygon3D[] = []) {
    if (polygonList.length === 0) return;

    const EPSILON = 1e-5;
    this.divider = polygonList[0];
    this.polygons.push(this.divider);

    const rest = polygonList.slice(1);
    const frontPolys: Polygon3D[] = [];
    const backPolys: Polygon3D[] = [];

    const dividerNormal = this.divider.getNormal();
    const d = -Vector3D.dotProduct(dividerNormal, this.divider!.vertices[0]);

    for (const poly of rest) {
      let frontCount = 0;
      let backCount = 0;

      for (const v of poly.vertices) {
        const res = Vector3D.dotProduct(dividerNormal, v) + d;
        if (res > EPSILON) frontCount++;
        else if (res < -EPSILON) backCount++;
      }

      if (frontCount > 0 && backCount === 0) frontPolys.push(poly);
      else if (backCount > 0 && frontCount === 0) backPolys.push(poly);
      else if (frontCount === 0 && backCount === 0) this.polygons.push(poly);
      else {
        console.warn('Polygon spans divider plane and is ignored (no split implemented).');
      }
    }

    if (frontPolys.length > 0) this.front = new BSPNode(frontPolys);
    if (backPolys.length > 0) this.back = new BSPNode(backPolys);
  }

  static traverse(node: BSPNode | null, camera: Camera): Polygon3D[] {
    if (!node || !node.divider) return [];

    const EPSILON = 1e-5;
    const n = node.divider.getNormal();
    const d = -Vector3D.dotProduct(n, node.divider!.vertices[0]);
    const cameraSide = Vector3D.dotProduct(n, camera.position) + d;

    let first: BSPNode | null;
    let second: BSPNode | null;

    if (cameraSide > EPSILON) {
      first = node.back;
      second = node.front;
    } else if (cameraSide < -EPSILON) {
      first = node.front;
      second = node.back;
    } else {
      first = node.back;
      second = node.front;
    }

    let order: Polygon3D[] = [];
    order = order.concat(BSPNode.traverse(first, camera));
    order = order.concat(node.polygons);
    order = order.concat(BSPNode.traverse(second, camera));
    return order;
  }
}
