import { Float32BufferAttribute } from "three";

export class SurfaceElement {
  /* the buffer attribute which holds the positions */
  public bufferAttribute: Float32BufferAttribute;
  /* index of the first point */
  public a: number;
  /* index of the second point */
  public b: number;
  /* index of the third point */
  public c: number;
  
  /**
   * @param bufferAttribute the buffer attribute which holds the positions
   * @param a index of the first point
   * @param b index of the second point
   * @param c index of the third point
   */
  constructor(bufferAttribute: Float32BufferAttribute, a: number, b: number, c: number){
    this.bufferAttribute = bufferAttribute;
    this.a = a;
    this.b = b;
    this.c = c;
  }



}

export default SurfaceElement