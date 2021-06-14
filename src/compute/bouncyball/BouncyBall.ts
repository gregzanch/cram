import * as THREE from "three"
import { Vector3 } from "three";
import { uuid } from "uuidv4";
import Container, { getContainersOfKind } from "../../objects/container";
import Source from "../../objects/source";
import Surface from "../../objects/surface";
import { renderer } from "../../render/renderer";

export class BouncyBall extends Container {

    source: Source; 

    current_direction: Vector3; 
    next_direction: Vector3 
    next_intersectionPoint: Vector3; 

    intersectableObjects: Array<THREE.Mesh | THREE.Object3D | Container>;

    constructor(source: Source,  initial_direction: Vector3, intersectableObjects: Array<THREE.Mesh | THREE.Object3D | Container>){
        super("billiard_ball")
        
        this.kind = "bouncyball"
        
        // bouncy ball visualization 
        let mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 32, 16),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        );

        mesh.userData["kind"] = "bouncyball";
        this.add(mesh);

        this.uuid = uuid();

        this.source = source; 
        this.x = source.x; 
        this.y = source.y; 
        this.z = source.z 

        this.intersectableObjects = intersectableObjects;

        this.current_direction = initial_direction; 
        this.next_direction = new Vector3; // placeholder
        this.next_intersectionPoint = new Vector3; // placeholder

        this.detectNextIntersection(); 

        this.renderCallback = (time?: number) => {};
        renderer.add(this);
    }

    public detectNextIntersection(){

        let raycaster = new THREE.Raycaster(this.position,this.current_direction) ;
        let raycaster_result = raycaster.intersectObjects(this.intersectableObjects,true); 
        
        let intersection = raycaster_result[0];

        
        this.next_intersectionPoint = intersection.point; 
        
        let surface_normal = new Vector3; 
        if(intersection.face?.normal != undefined){
            surface_normal = intersection.face?.normal; 
            surface_normal.normalize(); // safety 
        }
        
        // reflection calculation 
        this.next_direction.subVectors(this.current_direction,(surface_normal).multiplyScalar(2*(this.current_direction).dot(surface_normal)))

    }

    public step(distance: number){

        if(vectorsEqualWithinTolerance(this.position,this.next_intersectionPoint,0.2)){
            this.current_direction = this.next_direction.clone(); 
            this.detectNextIntersection(); 
        }

        this.x = this.x + this.current_direction.x*distance; 
        this.y = this.y + this.current_direction.y*distance;
        this.z = this.z + this.current_direction.z*distance;

        renderer.needsToRender = true 
    }
}

function vectorsEqualWithinTolerance(a: Vector3, b: Vector3, tolerance: number){
    let x_eq = numbersEqualWithinTolerance(a.x,b.x,tolerance);
    let y_eq = numbersEqualWithinTolerance(a.y,b.y,tolerance);
    let z_eq = numbersEqualWithinTolerance(a.z,b.z,tolerance); 

    if(x_eq && y_eq && z_eq){
        return true
    }else{
        return false 
    }
}

function numbersEqualWithinTolerance(a: number, b: number, tolerance: number){
    if (Math.abs(a - b) < tolerance) {
        return true
    }else{
        return false 
    }
}

export const getBilliards = () => getContainersOfKind<BouncyBall>("bouncyball");