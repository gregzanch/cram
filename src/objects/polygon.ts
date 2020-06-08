
export interface PolygonProps {
  vertices?: number[][];
  close?: boolean;
}

export class Polygon {
  vertices: THREE.Vector2[];
  close: boolean;
  shape!: THREE.Shape;
  constructor(props?: PolygonProps) {
    this.vertices = [] as THREE.Vector2[];
    this.close = props && props.hasOwnProperty('close') ? props.close! : true;
    if (props && props.vertices) {
      for (let i = 0; i < props.vertices.length; i++) {
        if (props.vertices[i].length != 2) {
          console.warn("args.vertices must be an array of 2d points. example: [[0,0],[0,1],[1,1],[1,0]]");
        }
        else {
          this.vertices.push(new THREE.Vector2(props.vertices[i][0], props.vertices[i][1]));
        }
      }
    }
    this.makeShape();
  }
  
  private makeShape() {
    this.shape = new THREE.Shape();
    this.shape.autoClose = this.close;
    if (this.vertices.length > 0) {
      for (let i = 0; i < this.vertices.length; i++){
        if (i == 0) {
          this.shape.moveTo(this.vertices[i].x, this.vertices[i].y);
        }
        else {
          this.shape.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
      }
    }
  }
}

export default Polygon;