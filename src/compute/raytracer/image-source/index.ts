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

export interface ImageSourceParams {
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

class ImageSource{

  public parentSource: Source; 
  
  public children: ImageSource[]; 
  public parentUUID: string | null;  

  public reflector: Surface | null; 
  public order: number; 
  public position: Vector3; 

  public uuid: string; 

  constructor(parentSource: Source, position: Vector3, reflector: Surface | null, order: number){
    this.parentSource = parentSource; 
    this.reflector = reflector; 
    this.order = order; 

    this.position = position; 

    this.children = []; 
    this.parentUUID = null;

    this.uuid = uuid(); 
  }

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

    constructor(params: ImageSourceParams){
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

        // assign image source
        let is: ImageSource = new ImageSource(source.clone(), source.position.clone(), null, 0);

        let surfaces: any[] = this.room.surfaces.children;
        
        let maxOrder = 2; 
        console.log(this.computeImageSources(is,maxOrder));
        console.log(this.imagesources);
        this.markupImageSources();

    }

    computeImageSources(is: ImageSource, maxOrder: number){

      let surfaces: any[] = this.room.surfaces.children; 
        
      // end recursion
      if(maxOrder==0){
        return;
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
          
          let reflectedSource: ImageSource = Object.assign({}, is); 
          let reflectedPosition: Vector3 = reflectPointAcrossSurface(reflectedSource.position,surfaces[i]);

          reflectedSource.position = reflectedPosition.clone(); 
          reflectedSource.order = is.order+1; 
          reflectedSource.reflector = surfaces[i]; 

          this.imagesources.push(reflectedSource);

          if(maxOrder > 0){
            this.computeImageSources(reflectedSource,maxOrder-1);
          }
        }
      }
      
    }

    createImageSourceTree(parentIs: ImageSource, imageSourceList: ImageSource[]){
    }

    markupImageSources(){
      // markup 
      for(let i = 0; i<this.imagesources.length; i++){
        let pos = this.imagesources[i].position.clone(); 
        let color: number[]; 
        switch(this.imagesources[i].order){
          case 1:
            color = [1,0,0];
            break;
          case 2:
            color = [235/255,116/255,52/255];
            break;
          case 3: 
            color = [235/255,204/255,52/255];
            break;
          case 4: 
            color = [112/255,235/255,52/255];
            break;
          case 5: 
            color = [52/255,180/255,235/255];
            break;
          case 6: 
            color = [70/255,52/255,235/255];
            break;
          case 7: 
            color = [195/255,52/255,235/255];
            break;
          default:
            color = [0,0,0];   
        }
        cram.state.renderer.markup.addPoint([pos.x,pos.y,pos.z], [color[0],color[1],color[2]]);
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
        return this.receiverIDs.map((x) => (this.containers[x] as Receiver).mesh) as THREE.Mesh[];
      } else return [];
    }

    get room(): Room {
      return this.containers[this.roomID] as Room;
    }

}

function isInFrontOf(surface1: Surface, surface2: Surface): boolean{
  // need to write this
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

const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value)
  }

  return outObject
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

function addChildToImageSource(baseIS: ImageSource, child: ImageSource){

  function addChild(c: ImageSource){
    if(c.uuid == child.uuid){
      c.children.push(child);
      return; 
    }else if(c.children != null){
      for(let i = 0; i<c.children.length; i++){
        addChild(c.children[i]);
      }
    }
  }

  addChild(baseIS);

}