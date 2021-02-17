// function computeImageSources(source, previousReflector, maxOrder) 
//     for each surface in geometry do 
//         if (not previousReflector) or 
//         ((inFrontOf(surface, previousReflector)) and (surface.normal dot previousReflector.normal < 0)) 
//             newSource = reflect(source, surface) 
//             sources[nofSources++] = newSource 
//             if (maxOrder > 0) 
//                 computeImageSources(newSource, surface, maxOrder - 1) 
// function constructImageSourcePath(is, listener) 
//     originalIs = is 
//     path[is.order + 1] = listener.location 
//     for order = originalIs.order to 1 do 
//         intersectionPoint = intersect(path[order + 1], is.location, is.reflector) 
//         if (not intersectionPoint) 
//             return NO_VALID_PATH 
//         path[order] = intersectionPoint 
//         is = is.parent 
//     path[0] = is.location     // The original sound source location, i.e. the root of the image source tree 
//     originalIs.path = path 
//     return OK 

import Solver from "../../solver";
import {uuid} from "uuidv4";
import * as THREE from "three";
import Room from "../../../objects/room";
import Messenger from "../../../messenger";
import { KVP } from "../../../common/key-value-pair";
import Container from "../../../objects/container";
import Renderer from "../../../render/renderer";
import Source from "../../../objects/source";
import Receiver from "../../../objects/receiver";
import { EqualStencilFunc, Vector3 } from "three";
import Surface from "../../../objects/surface";
import { LensTwoTone, ThreeSixtyOutlined } from "@material-ui/icons";
import { cloneElement } from "react";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

interface ImageSourceParams {
  baseSource: Source,
  position: Vector3,
  room: Room,  
  reflector: Surface | null,
  parent: ImageSource | null,  
  order: number,
}

class ImageSource{

  public baseSource: Source; 
  
  public children: ImageSource[]; 
  public parent: ImageSource | null;  

  public reflector: Surface | null; 
  public order: number; 
  public position: Vector3; 

  public room: Room;

  public uuid: string; 

  constructor(params: ImageSourceParams){
    this.baseSource = params.baseSource; 
    this.reflector = params.reflector; 
    this.order = params.order; 

    this.position = params.position; 

    this.children = []; 
    this.parent = params.parent; 

    this.room = params.room; 
    this.uuid = uuid(); 
  }

  public constructPathsForAllDescendents(r: Receiver): ImageSourcePath[]{
    let paths: ImageSourcePath[] = [];

    for(let i = 0; i<this.children.length; i++){
      
      let p = constructImageSourcePath(this.children[i],r); 
      p?.markup();

      if (p!= null){
        paths.push(p);
      }

      if(this.children[i].hasChildren){
        paths.concat(this.children[i].constructPathsForAllDescendents(r)); 
      } 
    }
    return paths; 
  }

  public markup(){
    for(let i = 0; i<this.children.length; i++){
      let pos: Vector3 = this.children[i].position.clone();
      cram.state.renderer.markup.addPoint([pos.x,pos.y,pos.z], [0,0,0]);

      if (this.children[i].hasChildren){
        this.children[i].markup(); 
      }else{
      }
    }
  }

  public getTotalDescendents(): number{
    let sum = 0; 

    for(let i = 0; i<this.children.length; i++){
      sum++;
      if(this.children[i].hasChildren){
        sum = sum + this.children[i].getTotalDescendents(); 
      } 
    }
    return sum; 
  }

  get hasChildren() {
    if (this.children.length > 0){
      return true; 
    }else{
      return false; 
    }
  }

}

class ImageSourcePath{
  public intersections: Vector3[]; 
  
  constructor(intersections: Vector3[]){
    this.intersections = intersections; 
  }

  markup(){
    for(let i = 0; i<this.intersections.length-1; i++){
      let p1: Vector3 = this.intersections[i].clone();
      let p2: Vector3 =  this.intersections[i+1].clone();
      cram.state.renderer.markup.addLine([p1.x,p1.y,p1.z],[p2.x,p2.y,p2.z]);
    }
  }
}

export interface ImageSourceSolverParams {
  renderer;
  messenger: Messenger;
  name?: string;
  roomID?: string;
  sourceIDs?: string[];
  surfaceIDs?: string[];
  containers?: KVP<Container>;
  receiverIDs?: string[];
  updateInterval?: number;
  passes?: number;
  pointSize?: number;
  reflectionOrder?: number;
  isRunning?: boolean;
  runningWithoutReceivers?: boolean;
  raysVisible?: boolean;
  pointsVisible?: boolean;
  invertedDrawStyle?: boolean;
  uuid?: string;
}

export class ImageSourceSolver extends Solver {

    sourceIDs: string[]; 
    receiverIDs: string[];
    roomID: string;
    surfaceIDs: string[];
    renderer: Renderer;   
    containers: KVP<Container | Room>; 
    messenger: Messenger; 

    imagesources: ImageSource[]; 

    constructor(params: ImageSourceSolverParams){
        super(params);
        this.kind = "image-source";
        this.name = "image source";
        this.roomID = params.roomID || "" as string; 
        this.sourceIDs = params.sourceIDs || [] as string[]; 
        this.receiverIDs = params.receiverIDs || [] as string[]; 
        this.renderer = params.renderer; 
        this.containers = params.containers || {} as KVP<Container>;
        this.messenger = params.messenger;

        this.surfaceIDs = []; 
        this.imagesources = []; 

    }

    test(){

        // get room 
        let room: Room = this.messenger.postMessage("FETCH_ROOMS")[0][0];
        this.roomID = room.uuid; 

        // assign IDs 
        for (const key in this.containers) {
            if (this.containers[key].kind === "source") {
              this.sourceIDs.push(key);
            } else if (this.containers[key].kind === "receiver") {
              this.receiverIDs.push(key);
            } else if (this.containers[key].kind === "surface") {
              this.surfaceIDs.push(key);
            }
        }

        // get source
        let source: Source = this.messenger.postMessage("FETCH_SOURCE",this.sourceIDs[0])[0];

        // assign base image source
        let is_params: ImageSourceParams = {
          baseSource: source.clone(),
          position: source.position.clone(), 
          room: room, 
          reflector: null,
          parent: null, 
          order: 0, 
        };

        let is: ImageSource = new ImageSource(is_params);
        
        let maxOrder = 2; 
        let n; 
        let is_2 = computeImageSources(is,maxOrder); 
        is_2?.markup(); 
        console.log(is_2); 

        let receiver: Receiver = this.receivers[0];
        console.log(receiver);

        console.log(is_2?.constructPathsForAllDescendents(receiver)); 

        //let path = constructImageSourcePath((is.children[4]).children[2], receiver);
        //console.log(path);
        //(path != null) && path.markup(); 
    }

    markupImageSources(){
      for(let i = 0; i<this.imagesources.length; i++){
        let pos = this.imagesources[i].position.clone(); 
        let color: number[]; 
        cram.state.renderer.markup.addPoint([pos.x,pos.y,pos.z], [1,1,1]);
      }
    }

    get sources() {
      if (this.sourceIDs.length > 0) {
        return this.sourceIDs.map((x) => this.containers[x]);
      } else {
        return [];
      }
    }
    get receivers() {
      if (this.receiverIDs.length > 0 && Object.keys(this.containers).length > 0) {
        return this.receiverIDs.map((x) => (this.containers[x] as Receiver));
      } else return [];
    }

    get room(): Room {
      return this.containers[this.roomID] as Room;
    }

}

function computeImageSources(is: ImageSource, maxOrder: number): ImageSource | null {

  let surfaces: any[] = is.room.surfaces.children; 
    
  // end recursion
  if(maxOrder==0){
    return null;
  }

  for(let i=0; i<surfaces.length; i++){
  
    // returns true if current image source's previous reflector is either null (direct sound) or not the current reflector. 
    let reflectorCondition: boolean = (is.reflector == null || is.reflector != surfaces[i]);

    // returns true if reflecting surface is in front of previous surface
    let inFrontOf: boolean = true; 

    // check if facing each other
    let facingEachOther: boolean; 
    if(is.reflector!=null){
      facingEachOther = surfacesFacingEachother(surfaces[i], is.reflector); 
    }else{
      facingEachOther = true;
    }

    if(reflectorCondition && (inFrontOf && facingEachOther)){

      let is_reflect_params: ImageSourceParams = {
        baseSource: is.baseSource,
        position: reflectPointAcrossSurface(is.position.clone(),surfaces[i]).clone(), 
        room: is.room, 
        reflector: surfaces[i],
        parent: is, 
        order: is.order+1, 
      };
      
      let reflectedSource: ImageSource = new ImageSource(is_reflect_params); 

      is.children.push(reflectedSource);

      if(maxOrder > 0){
        computeImageSources(reflectedSource,maxOrder-1);
      }
    }
  }
  return is; 
}

function constructImageSourcePath(is: ImageSource, listener: Receiver): ImageSourcePath | null{
  // note: will return null
  // otherwise, will return array of Vector3's representing path 

  let path: Vector3[] = []; 
  
  let maxOrder = is.order; 
  path[maxOrder+1] = listener.position.clone(); 

  let raycaster = new THREE.Raycaster(); 

  for(let order = maxOrder; order>=1; order--){
    let origin: Vector3 = is.position.clone(); 
    let lastPosition: Vector3 = (path[order+1]).clone(); 

    let direction: Vector3 = new Vector3(0,0,0); // from current image source to last image source / receiver
    direction.subVectors(lastPosition, origin);
    direction.normalize(); 

    raycaster.set(origin,direction);
    let intersections; 
    if(is.reflector != null){
      intersections = raycaster.intersectObject(is.reflector,true);
    }
    
    if(intersections.length>0){
      path[order] = intersections[0].point; 
    }else{
      return null; // no valid path
    }

    if(is.parent != null){
      is = is.parent; 
    }

  }

  path[0] = is.position;
  let pathObject = new ImageSourcePath(path); 
  return pathObject;
}

function isInFrontOf(surface1: Surface, surface2: Surface): boolean{
  // how to check this? 
  return true; 
}

function surfacesFacingEachother(surface1: Surface, surface2: Surface): boolean{
  let normal1: Vector3 = surface1.normal.clone(); 
  let normal2: Vector3 = surface2.normal.clone(); 

  if(normal1.dot(normal2) <= 0){
    return true;
  }else{
    return false; 
  }
}

function reflectPointAcrossSurface(point: Vector3, surface: Surface): Vector3{

  // SEE https://gamedev.stackexchange.com/questions/43615/how-can-i-reflect-a-point-with-respect-to-the-plane

  let a: Vector3 = new Vector3(surface.polygon.vertices[0][0], surface.polygon.vertices[0][1], surface.polygon.vertices[0][2]);
  let b: Vector3 = new Vector3(surface.polygon.vertices[1][0], surface.polygon.vertices[1][1], surface.polygon.vertices[1][2]);
  let c: Vector3 = new Vector3(surface.polygon.vertices[2][0], surface.polygon.vertices[2][1], surface.polygon.vertices[2][2]);

  let a_global: Vector3 = surface.localToWorld(a);
  let b_global: Vector3 = surface.localToWorld(b);
  let c_global: Vector3 = surface.localToWorld(c);

  b_global.sub(a_global);
  c_global.sub(a_global);
  b_global.cross(c_global);
  b_global.normalize(); 
  let normal_calc = b_global; 

  let normal = surface.normal.clone();
  let negnormal = normal.clone(); 
  negnormal.multiplyScalar(-1);

  let d = a_global.dot(negnormal);
  
  let u = normal.clone(); 
  u.multiplyScalar(point.dot(normal)+d); 
  
  let v = point.clone(); 
  v.sub(u);

  let mirror = u; 
  mirror.multiplyScalar(-1);
  mirror.add(v);

  return mirror; 
}