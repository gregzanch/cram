
import * as THREE from 'three';
import Container from './container';

export interface ConstructionPlaneProps {
  normal: THREE.Vector3;
  point: THREE.Vector3;
  width?: number;
  height?: number;
}

class ConstructionPlane extends Container {
  mesh: THREE.Mesh;
  constructor(name: string, props: ConstructionPlaneProps) {
    super(name);
    this.kind = "construction-plane";
    const normal = props.normal;
    const centroid = props.point;
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(normal, centroid).normalize();


    const planeGeometry = new THREE.PlaneBufferGeometry(props.width || 10, props.height || 10);
    // planeGeometry.translate(centroid, y, z)

    // Align the geometry to the plane
    const coplanarPoint = new THREE.Vector3();
    plane.coplanarPoint(coplanarPoint);
    const focalPoint = new THREE.Vector3().copy(coplanarPoint).add(plane.normal);
    planeGeometry.lookAt(focalPoint);
    planeGeometry.translate(centroid.x, centroid.y, centroid.z);

    // Create mesh with the geometry
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xBC7904,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.05
    });
    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    
    this.add(this.mesh);
  }
  select() {
    this.selected = true;
    (this.mesh.material as THREE.MeshLambertMaterial).opacity = 0.35;
    (this.mesh.material as THREE.MeshLambertMaterial).color.setHex(0xFFC32A);
  }
  deselect() {
    this.selected = false;
    (this.mesh.material as THREE.MeshLambertMaterial).opacity = 0.05;
    (this.mesh.material as THREE.MeshLambertMaterial).color.setHex(0xbc7904);
  }
}

export { ConstructionPlane }
export default ConstructionPlane;