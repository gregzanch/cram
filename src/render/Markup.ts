import * as THREE from 'three';
import Container, { ContainerProps } from '../objects/container';
import PointShader from "./shaders/points";
import { triggerAsyncId } from 'async_hooks';

export interface MarkupProps extends ContainerProps{
  maxlines: number;
  pointScale: number;
  maxpoints: number;
}
export const defaultMarkupProps = {
  maxlines: 1e4 - 1,
  maxpoints: 1e4 - 1,
  pointScale: 3
}
export class Markup extends Container{
  linesBufferGeometry: THREE.BufferGeometry;
  pointsBufferGeometry: THREE.BufferGeometry;

  maxlines: number;
  maxpoints: number;

  linesBufferAttribute: THREE.Float32BufferAttribute;
  pointsBufferAttribute: THREE.Float32BufferAttribute;


  lines: THREE.LineSegments;
  points: THREE.Points;
  colorBufferAttribute: THREE.Float32BufferAttribute;
  lineColorBufferAttribute: THREE.Float32BufferAttribute;
  linePositionIndex: number;
  pointsPositionIndex: number;
  pointScale: number;
  boxes: Container;
  constructor(props?: MarkupProps) {
    super("markup", props);
    
    this.maxlines = props && props.maxlines || defaultMarkupProps.maxlines;
    this.maxpoints = props && props.maxpoints || defaultMarkupProps.maxpoints;
    this.pointScale = props && props.pointScale || defaultMarkupProps.pointScale;
    
    this.linePositionIndex = 0;
    this.pointsPositionIndex = 0;
    
    this.linesBufferGeometry = new THREE.BufferGeometry();
    this.pointsBufferGeometry = new THREE.BufferGeometry();
    
    this.linesBufferGeometry.name = "markup-linesBufferGeometry";
    this.pointsBufferGeometry.name = "markup-linesBufferGeometry";
    
    this.linesBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxlines), 3);
    this.pointsBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxpoints), 3);
    
    this.linesBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    this.pointsBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    
    this.linesBufferGeometry.setAttribute("position", this.linesBufferAttribute);
    this.pointsBufferGeometry.setAttribute("position", this.pointsBufferAttribute);
    
    this.linesBufferGeometry.setDrawRange(0, this.maxlines);
    this.linesBufferGeometry.setDrawRange(0, this.maxpoints);
    
    this.colorBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxpoints), 3);
    this.colorBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    
    this.lineColorBufferAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.maxlines), 3);
    this.lineColorBufferAttribute.setUsage(THREE.DynamicDrawUsage);
    
    this.linesBufferGeometry.setAttribute("color", this.lineColorBufferAttribute);
    this.pointsBufferGeometry.setAttribute("color", this.colorBufferAttribute);
    
    this.lines = new THREE.LineSegments(
      this.linesBufferGeometry,
      new THREE.LineBasicMaterial({
        fog: false,
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: 0.2,
        premultipliedAlpha: true,
        blending: THREE.NormalBlending,
        depthFunc: THREE.AlwaysDepth,
        name: "markup-material",
        linewidth: 5
        // depthTest: false
      })
    );
    this.lines.renderOrder = -0.5;
    this.lines.frustumCulled = false;
    this.add(this.lines);
    
    
    this.points = new THREE.Points(
      this.pointsBufferGeometry,
      new THREE.ShaderMaterial({
      fog: false,
      vertexShader: PointShader.vs,
      fragmentShader: PointShader.fs,
      transparent: true,
      premultipliedAlpha: true,
      uniforms: {
        pointScale: { value: this.pointScale }
      },
      blending: THREE.NormalBlending,
      name: "markup-points-material"
    }));
    this.points.frustumCulled = false;
    this.add(this.points);
    
    this.boxes = new Container("boxes");
    this.add(this.boxes);
    
  }
  addLine(p1: [number, number, number], p2: [number, number, number], c1: [number, number, number] = [0.16, 0.16, 0.16], c2: [number, number, number] = [0.16,0.16,0.16]) {
    // set p1
    this.linesBufferAttribute.setXYZ(this.linePositionIndex++, p1[0], p1[1], p1[2]);

    // set the color
    this.lineColorBufferAttribute.setXYZ(this.linePositionIndex, ...c1);

    // set p2
    this.linesBufferAttribute.setXYZ(this.linePositionIndex++, p2[0], p2[1], p2[2]);

    // set the color
    this.lineColorBufferAttribute.setXYZ(this.linePositionIndex, ...c2);

    //update the draw range
    this.linesBufferGeometry.setDrawRange(0, this.linePositionIndex);

    // update three.js
    this.linesBufferAttribute.needsUpdate = true;

    //update version
    this.linesBufferAttribute.version++;

    // update three.js
    this.lineColorBufferAttribute.needsUpdate = true;

    //update version
    this.lineColorBufferAttribute.version++;
  }
  addPoint(p1: [number, number, number], color: [number, number, number]) {
    // set p1
    this.pointsBufferAttribute.setXYZ(this.pointsPositionIndex++, p1[0], p1[1], p1[2]);

    // set the color
    this.colorBufferAttribute.setXYZ(this.pointsPositionIndex, color[0], color[1], color[2]);

    //update the draw range
    this.pointsBufferGeometry.setDrawRange(0, this.pointsPositionIndex);

    // update three.js
    this.pointsBufferAttribute.needsUpdate = true;

    //update version
    this.pointsBufferAttribute.version++;

    // update three.js
    this.colorBufferAttribute.needsUpdate = true;

    //update version
    this.colorBufferAttribute.version++;
  }
  clearPoints(){
    this.pointsBufferGeometry.dispose(); 
    this.pointsBufferAttribute.needsUpdate = true; 
    this.colorBufferAttribute.needsUpdate = true; 
    this.pointsPositionIndex = 0;
    this.pointsBufferGeometry.setDrawRange(0,this.pointsPositionIndex);
  }
  clearLines(){
    this.linesBufferGeometry.dispose();
    this.linesBufferAttribute.needsUpdate = true;
    this.lineColorBufferAttribute.needsUpdate = true;
    this.linePositionIndex = 0; 
    this.linesBufferGeometry.setDrawRange(0,this.linePositionIndex);
  }
  addBox(min: [number, number, number], max: [number, number, number], color: [number, number, number]=[Math.random(), Math.random(), Math.random()]) {
    // const box = new THREE.Box3(new THREE.Vector3().fromArray(min), new THREE.Vector3().fromArray(max));
    const length = Math.abs(max[0] - min[0]);
    const width = Math.abs(max[1] - min[1]);
    const height = Math.abs(max[2] - min[2]);
    const geom = new THREE.BoxBufferGeometry(length, width, height);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      transparent: true,
      opacity: 0.2
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.translateX(length / 2 + min[0]);
    mesh.translateY(width / 2 + min[1]);
    mesh.translateZ(height / 2 + min[2]);
    this.boxes.add(mesh);
    return mesh;
  }
}