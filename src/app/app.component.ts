import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Camera} from './models/camera';
import {Point3D} from './models/point3d';
import {Polygon3D} from './models/polygon3d';
import {Vector3D} from './models/vector3d';
import {BSPNode} from './models/bsp-node';
import {Matrix4x4} from './models/matrix4x4';
import {Box3D} from './models/box3d';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', {static: true}) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private camera!: Camera;
  private cameraRotationMatrix: Matrix4x4 = new Matrix4x4();
  private scenePolygons: Polygon3D[] = [];
  private bspTree: BSPNode | null = null;
  private readonly CANVAS_SIZE = 600;
  private readonly PI = Math.PI;
  private orbitRadius = 1;
  private orbitTheta = 0;
  private orbitPhi = 0;
  private orbitCenter: Point3D = new Point3D(0, 0, 0);
  private targetOrbitTheta = 0;
  private targetOrbitPhi = 0;
  private targetOrbitRadius = 1;
  private roll = 0;
  private targetRoll = 0;

  private isFlipped = false;

  private readonly TILT_STEP = 0.04;
  private readonly ORBIT_STEP = 0.04;
  private readonly ROLL_STEP = 0.04;
  private readonly PAN_STEP = 20;
  private readonly ANGLE_L = 0.5;
  private readonly RADIUS_L = 0.04;

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.width = this.CANVAS_SIZE;
    this.canvas.nativeElement.height = this.CANVAS_SIZE;
    this.camera = new Camera(new Point3D(0, 300, -1200), 1.0);
    this.cameraRotationMatrix = new Matrix4x4();
    this.createScene();
    this.bspTree = BSPNode.build(this.scenePolygons);
    this.orbitCenter = this.getSceneCenter();
    this.initSphericalFromPosition(true);
    this.recomputePositionFromSpherical(this.orbitPhi);
    this.loop();
  }

  private loop = () => {

    const PI_HALF = this.PI / 2;
    const PI = this.PI;

    if (this.targetOrbitPhi > PI_HALF || this.targetOrbitPhi < -PI_HALF) {

      this.roll = this.wrapAngle(this.roll + PI);
      this.targetRoll = this.wrapAngle(this.targetRoll + PI);

      this.orbitTheta = this.wrapAngle(this.orbitTheta + PI);
      this.targetOrbitTheta = this.wrapAngle(this.targetOrbitTheta + PI);

      if (this.targetOrbitPhi > PI_HALF) {
        this.orbitPhi = PI - this.orbitPhi;
        this.targetOrbitPhi = PI - this.targetOrbitPhi;
      } else if (this.targetOrbitPhi < -PI_HALF) {
        this.orbitPhi = -PI - this.orbitPhi;
        this.targetOrbitPhi = -PI - this.targetOrbitPhi;
      }

      this.isFlipped = !this.isFlipped;

      this.orbitPhi = this.targetOrbitPhi;
    }

    this.orbitTheta = this.lAngle(this.orbitTheta, this.targetOrbitTheta, this.ANGLE_L);
    this.orbitRadius = this.lScalar(this.orbitRadius, this.targetOrbitRadius, this.RADIUS_L);
    this.roll = this.lAngle(this.roll, this.targetRoll, this.ANGLE_L);

    this.orbitPhi = this.lAngle(this.orbitPhi, this.targetOrbitPhi, this.ANGLE_L);

    this.recomputePositionFromSpherical(this.orbitPhi);

    this.ctx.clearRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);

    let renderOrder: Polygon3D[] = [];
    if (this.bspTree) {
      renderOrder = BSPNode.traverse(this.bspTree, this.camera);
    }

    for (const polygon of renderOrder) {
      this.renderPolygon(polygon);
    }
    requestAnimationFrame(this.loop);
  };


  private renderPolygon(polygon: Polygon3D): void {
    const projectedPoints = polygon.vertices.map(p => this.camera.project(p, this.CANVAS_SIZE));
    const allBehind = projectedPoints.every(p => p.isBehind);
    if (allBehind) return;
    const points2D = projectedPoints.map(p => ({x: p.x, y: p.y}));
    this.ctx.beginPath();
    this.ctx.moveTo(points2D[0].x, points2D[0].y);
    for (let i = 1; i < points2D.length; i++) {
      this.ctx.lineTo(points2D[i].x, points2D[i].y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = polygon.color;
    this.ctx.fill();
    this.ctx.moveTo(points2D[0].x, points2D[0].y);
    for (let i = 1; i < points2D.length; i++) {
      this.ctx.lineTo(points2D[i].x, points2D[i].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const E = this.cameraRotationMatrix.elements;
    const R = new Vector3D(E[0], E[4], E[8]).normalize();
    const U = new Vector3D(E[1], E[5], E[9]).normalize();
    const F = new Vector3D(E[2], E[6], E[10]).normalize();
    let moveX = 0;
    let moveY = 0;
    let moveZ = 0;

    switch (event.key) {
      case 'ArrowLeft':
        moveX -= this.PAN_STEP;
        break;
      case 'ArrowRight':
        moveX += this.PAN_STEP;
        break;
      case 'ArrowUp':
        moveY += this.PAN_STEP;
        break;
      case 'ArrowDown':
        moveY -= this.PAN_STEP;
        break;
      case 'a':
        this.targetOrbitTheta += this.ORBIT_STEP;
        break;
      case 'd':
        this.targetOrbitTheta -= this.ORBIT_STEP;
        break;
      case 'w':
        if (this.isFlipped) {
          this.targetOrbitPhi += this.TILT_STEP;
        } else {
          this.targetOrbitPhi -= this.TILT_STEP;
        }
        break;
      case 's':
        if (this.isFlipped) {
          this.targetOrbitPhi -= this.TILT_STEP;
        } else {
          this.targetOrbitPhi += this.TILT_STEP;
        }
        break;
      case 'q':
        this.targetRoll -= this.ROLL_STEP;
        this.targetRoll = this.wrapAngle(this.targetRoll);
        break;
      case 'e':
        this.targetRoll += this.ROLL_STEP;
        this.targetRoll = this.wrapAngle(this.targetRoll);
        break;
        case 'x':
        this.camera.zoom *= 0.9;
        break;
        case 'z':
        this.camera.zoom *= 1.1;
        break;
      default:
        break;
    }
    
    if (moveX !== 0 || moveY !== 0 || moveZ !== 0) {
      const totalMoveX = R.x * moveX + U.x * moveY + F.x * moveZ;
      const totalMoveY = R.y * moveX + U.y * moveY + F.y * moveZ;
      const totalMoveZ = R.z * moveX + U.z * moveY + F.z * moveZ;
      this.orbitCenter.x += totalMoveX;
      this.orbitCenter.y += totalMoveY;
      this.orbitCenter.z += totalMoveZ;
      this.camera.position.x += totalMoveX;
      this.camera.position.y += totalMoveY;
      this.camera.position.z += totalMoveZ;
      this.initSphericalFromPosition(false);
    }
  }


  private initSphericalFromPosition(updateTargets: boolean = true) {
    const c = this.orbitCenter;
    const vx = this.camera.position.x - c.x;
    const vy = this.camera.position.y - c.y;
    const vz = this.camera.position.z - c.z;
    this.orbitRadius = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    this.orbitTheta = Math.atan2(vx, vz);
    const horizontalDist = Math.sqrt(vx * vx + vz * vz);
    this.orbitPhi = Math.atan2(vy, horizontalDist);
    if (updateTargets) {
      this.targetOrbitTheta = this.orbitTheta;
      this.targetOrbitPhi = this.orbitPhi;
    }
    this.targetOrbitRadius = this.orbitRadius;
  }

  private recomputePositionFromSpherical(phi: number) {
    const r = this.orbitRadius;
    const theta = this.orbitTheta;
    const cosPhi = Math.cos(phi);
    const x = r * Math.sin(theta) * cosPhi;
    const z = r * Math.cos(theta) * cosPhi;
    const y = r * Math.sin(phi);
    this.camera.position.x = this.orbitCenter.x + x;
    this.camera.position.y = this.orbitCenter.y + y;
    this.camera.position.z = this.orbitCenter.z + z;
    this.orientCameraTowards(this.orbitCenter, this.roll);
  }

  private orientCameraTowards(target: Point3D, rollAngle: number) {
    const forward = new Vector3D(
      target.x - this.camera.position.x,
      target.y - this.camera.position.y,
      target.z - this.camera.position.z
    ).normalize();
    const worldUp = new Vector3D(0, 1, 0);
    let right = Vector3D.crossProduct(worldUp, forward);
    const eps = 1e-6;
    if (Math.abs(right.x) < eps && Math.abs(right.y) < eps && Math.abs(right.z) < eps) {
      right = Vector3D.crossProduct(new Vector3D(1, 0, 0), forward);
    }
    right = right.normalize();
    let up = Vector3D.crossProduct(forward, right).normalize();
    if (Math.abs(rollAngle) > 1e-9) {
      right = this.rotateVectorAroundAxis(right, forward, rollAngle);
      up = this.rotateVectorAroundAxis(up, forward, rollAngle);
    }
    const viewRotation = Matrix4x4.fromArray([
      right.x, right.y, right.z, 0,
      up.x, up.y, up.z, 0,
      forward.x, forward.y, forward.z, 0,
      0, 0, 0, 1
    ]);
    const translation = Matrix4x4.translation(
      -this.camera.position.x,
      -this.camera.position.y,
      -this.camera.position.z
    );
    this.camera.transformMatrix = Matrix4x4.multiplyMatrix(viewRotation, translation);
    this.cameraRotationMatrix = viewRotation.transpose();
  }

  private lScalar(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private lAngle(a: number, b: number, t: number) {
    let diff = b - a;
    const TWO_PI = this.PI * 2;
    diff = ((diff + this.PI) % TWO_PI + TWO_PI) % TWO_PI - this.PI;
    return a + diff * t;
  }

  private wrapAngle(a: number) {
    const PI = this.PI;
    const TWO_PI = PI * 2;
    a = ((a + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
    return a;
  }

  private rotateVectorAroundAxis(v: Vector3D, axis: Vector3D, angle: number): Vector3D {
    const uLen = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    if (uLen < 1e-9) return v;
    const ux = axis.x / uLen;
    const uy = axis.y / uLen;
    const uz = axis.z / uLen;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const crossX = uy * v.z - uz * v.y;
    const crossY = uz * v.x - ux * v.z;
    const crossZ = ux * v.y - uy * v.x;
    const dot = ux * v.x + uy * v.y + uz * v.z;
    return new Vector3D(
      v.x * cosA + crossX * sinA + ux * dot * (1 - cosA),
      v.y * cosA + crossY * sinA + uy * dot * (1 - cosA),
      v.z * cosA + crossZ * sinA + uz * dot * (1 - cosA)
    );
  }
  private getSceneCenter(): Point3D {
    if (!this.scenePolygons || this.scenePolygons.length === 0) return new Point3D(0, 0, 0);
    let sx = 0, sy = 0, sz = 0;
    for (const p of this.scenePolygons) {
      const c = p.getCenter();
      sx += c.x;
      sy += c.y;
      sz += c.z;
    }
    const n = this.scenePolygons.length;
    return new Point3D(sx / n, sy / n, sz / n);
  }

  private createScene() {
    this.scenePolygons = [];
    const colors = ['#ff6666', '#66cc66', '#6666ff', '#ffcc66', '#cc66ff', '#66ffff'];
    const spacingX = 220;
    const spacingZ = 300;
    const startX = -spacingX;
    const startZ = -spacingZ / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * spacingX;
        const z = startZ + row * spacingZ;
        const color = colors[(row * 3 + col) % colors.length];
        const box = new Box3D(x - 50, 0, z - 50, 100, 150, 100, color);
        for (const p of box.polygons) {
          this.scenePolygons.push(p);
        }
      }
    }
  }
}
