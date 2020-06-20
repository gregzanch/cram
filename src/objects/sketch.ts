import * as THREE from 'three';


export interface SketchProps {
  normal: THREE.Vector3;
  point: THREE.Vector3;
}

class Sketch extends THREE.Group {
  sketchPlane: THREE.Plane;
  sketchPlaneMesh: THREE.Mesh;
  sketchPlaneMaterial: THREE.MeshLambertMaterial;
  sketchPlaneNormal: THREE.Vector3;
  sketchPlaneCentroid: THREE.Vector3;
  constructor(props: SketchProps) {
    super();

    // Create plane
    this.sketchPlaneNormal = props.normal;
    this.sketchPlaneCentroid = props.point;
    this.sketchPlane = new THREE.Plane();
    this.sketchPlane.setFromNormalAndCoplanarPoint(this.sketchPlaneNormal, this.sketchPlaneCentroid).normalize();


    var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000);

    // Align the geometry to the plane
    const coplanarPoint = new THREE.Vector3();
    this.sketchPlane.coplanarPoint(coplanarPoint);
    var focalPoint = new THREE.Vector3().copy(coplanarPoint).add(this.sketchPlane.normal);
    planeGeometry.lookAt(focalPoint);
    planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

    // Create mesh with the geometry
    this.sketchPlaneMaterial = new THREE.MeshLambertMaterial({
      color: 0xBC7904,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.05
    });
    this.sketchPlaneMesh = new THREE.Mesh(planeGeometry, this.sketchPlaneMaterial);
    
    this.add(this.sketchPlaneMesh);
    
  }
  
  
  
}

export { Sketch }
export default Sketch;