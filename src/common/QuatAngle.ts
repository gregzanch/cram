import { Vector3, Quaternion } from 'three';

function quat2angle(quat: Quaternion) {
  const angle = Math.acos(quat.w);
  const i = quat.x / Math.sin(angle);
  const j = quat.y / Math.sin(angle);
  const k = quat.z / Math.sin(angle);
  const mag = Math.sqrt(i ** 2 + j ** 2 + k ** 2);
  const qa = new QuatAngle(angle, new Vector3(i/mag,j/mag,k/mag));
  return qa
}

function angle2quat(quatAngle: QuatAngle) {
  const angle = quatAngle.angle;
  const w = Math.cos(quatAngle.angle);
  const x = Math.sin(quatAngle.angle) * quatAngle.i;
  const y = Math.sin(quatAngle.angle) * quatAngle.j;
  const z = Math.sin(quatAngle.angle) * quatAngle.k;
  return new Quaternion(x, y, z, w);
}


class QuatAngle {
  private _angle: number;
  public vector: Vector3;
  
  /**
   * 
   * @param angle {number} angle
   * @param vector {Vector3} vector
   */
  constructor(angle: number = 0, vector: Vector3 = new Vector3(0,0,1)) {
    this._angle = angle;
    this.vector = vector;
  }
  toQuaternion() {
    return angle2quat(this);
  }
  fromQuaternion(quat: Quaternion) {
    const qa = quat2angle(quat);
    this.angle = qa.angle;
    this.vector = qa.vector.clone();
    return this;
  }
  get i() {
    return this.vector.x;
  }
  set i(val: number) {
    this.vector.setX(val);
  }
  get j() {
    return this.vector.y;
  }
  set j(val: number) {
    this.vector.setY(val);
  }
  get k() {
    return this.vector.z;
  }
  set k(val: number) {
    this.vector.setZ(val);
  }
  get angle() {
    return this._angle;
  }
  set angle(newAngle: number) {
    this._angle = newAngle % (Math.PI * 2);
  }
}

export {
  quat2angle,
  angle2quat,
  QuatAngle
};

export default QuatAngle;