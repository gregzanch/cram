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
import { renderer } from "../../../render/renderer";
import {uuid} from "uuidv4";
import * as THREE from "three";
import * as ac from "../../acoustics";
import Room from "../../../objects/room";
import Messenger, { messenger, on } from "../../../messenger";
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
import { intersection } from "lodash";
import { addSolver, removeSolver, setSolverProperty, useSolver } from "../../../store";
import { RayPath } from "..";


interface ImageSourceParams {
  baseSource: Source,
  position: Vector3,
  room: Room,  
  reflector: Surface | null,
  parent: ImageSource | null,  
  order: number,
}

class ImageSource{

  // the source that all image sources are based off of
  // note: this is not the parent image source! that is 'parent' below 
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

  public constructPathsForAllDescendents(r: Receiver,constructForThis=true): ImageSourcePath[]{
    let paths: ImageSourcePath[] = [];

    // compute direct sound path
    if(constructForThis){
      let thisPath = constructImageSourcePath(this, r); 
      if(thisPath != null){
        paths.push(thisPath); 
      }
    }

    for(let i = 0; i<this.children.length; i++){
      let p = constructImageSourcePath(this.children[i],r); 

      if (p!= null){
        paths.push(p);
      }

      if(this.children[i].hasChildren){
        paths = paths.concat(this.children[i].constructPathsForAllDescendents(r,false)); 
      } 

    }
    return paths; 
  }

  public markup(){
    for(let i = 0; i<this.children.length; i++){
      let pos: Vector3 = this.children[i].position.clone();
      renderer.markup.addPoint([pos.x,pos.y,pos.z], [0,0,0]);
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

interface intersection{
  point: Vector3; 
  reflectingSurface: Surface | null;
  angle: number | null; 
}

class ImageSourcePath{

  public path: intersection[]; 
  
  constructor(path: intersection[]){
    this.path = path; 
  }

  markup(){
    for(let i = 0; i<this.path.length-1; i++){
      let p1: Vector3 = (this.path[i]).point.clone();
      let p2: Vector3 =  (this.path[i+1]).point.clone();
      renderer.markup.addLine([p1.x,p1.y,p1.z],[p2.x,p2.y,p2.z]);
    }
  }

  isvalid(room_surfaces: Surface[]): boolean{

    for(let order = 1; order <= this.order+1; order++){

      let segmentStart: Vector3 = this.path[order-1].point;
      let segmentEnd: Vector3 = this.path[order].point; 

      let prevReflector: Surface | null = this.path[order-1].reflectingSurface; 
      let reflector: Surface | null = this.path[order].reflectingSurface; 

      for(let j = 1; j<room_surfaces.length; j++){
        if((room_surfaces[j] !== prevReflector) && (room_surfaces[j] !== reflector)){

          // from current image source to last image source / receiver
          let direction: Vector3 = new Vector3(0,0,0); 
          direction.subVectors(segmentEnd, segmentStart);
          direction.normalize(); 

          let raycaster = new THREE.Raycaster; 
          raycaster.set(segmentStart,direction);
          let intersections; 
          intersections = raycaster.intersectObject(room_surfaces[j].mesh, true);

          // remove any intersections of surfaces BEHIND the desired end point
          // (verify this)
          let trueIntersections = [];
          for(let i = 0; i<intersections.length; i++){
            if(segmentStart.distanceTo(intersections[i].point) < segmentStart.distanceTo(segmentEnd)){
              //@ts-ignore
              trueIntersections.push(intersections[i]);
            }
          }

          if (trueIntersections.length > 0){
            return false; 
          }
        }
      }

    }
    return true; 
  }

  public get order(){
    return this.path.length - 2; 
  }

  public get totalLength(){
    let length: number = 0; 
    let startingPoint: Vector3; 
    let endingPoint: Vector3;
    for(let i = 1; i<this.path.length; i++){
      startingPoint = this.path[i-1].point;
      endingPoint = this.path[i].point;
      length = length+startingPoint.distanceTo(endingPoint); 
    }
    return length; 
  }
  
  public arrivalPressure(initialSPL: number[], freqs: number[]): number[]{

    let intensity = ac.P2I(ac.Lp2P(initialSPL)); 
    let arrivalPressure = []; 

    for(let s = 0; s<this.path.length; s++){

      let intersection = this.path[s];
      if(intersection.reflectingSurface == null){
        // either source or a receiver
        // do nothing to intensity levels
      }else{
        // intersected with a surface
        for(let findex = 0; findex<freqs.length; findex++){
          // @ts-ignore
          //let reflectionCoefficient = (intersection.reflectingSurface as Surface).reflectionFunction(freqs[findex],intersection.angle);
          let reflectionCoefficient = 1-(intersection.reflectingSurface as Surface).absorptionFunction(freqs[findex]); 
          intensity[findex] = intensity[findex]*reflectionCoefficient; 
        }

      }

    }

    // convert back to SPL 
    let arrivalLp = ac.P2Lp(ac.I2P(intensity)); 
    
    // apply air absorption (dB/m)
    const airAttenuationdB = ac.airAttenuation(freqs); 
    for(let f = 0; f<freqs.length; f++){
      arrivalLp[f] = arrivalLp[f] - airAttenuationdB[f]*this.totalLength; 
    }

    // convert back to pressure
    return ac.Lp2P(arrivalLp) as number[]; 
  }

  public arrivalTime(c: number): number{
    return this.totalLength / c; 
  }
}

export interface ImageSourceSolverParams {
  name: string;
  roomID: string;
  sourceIDs: string[];
  surfaceIDs: string[];
  containers: KVP<Container>;
  receiverIDs: string[];
  maxReflectionOrder: number;
  imageSourcesVisible: boolean;
  rayPathsVisible: boolean;
}

const defaults = {
  name: "image-source-class",
  roomID: "",
  sourceIDs: [] as string[],
  surfaceIDs: [] as string[],
  containers: {} as KVP<Container>,
  receiverIDs: [] as string[],
  maxReflectionOrder: 2,
  imageSourcesVisible: true,
  rayPathsVisible: true, 
};

export class ImageSourceSolver extends Solver {

    sourceIDs: string[]; 
    receiverIDs: string[];
    roomID: string;
    surfaceIDs: string[];
    containers: KVP<Container>; 
    uuid: string; 

    maxReflectionOrder: number; 
    
    private _imageSourcesVisible: boolean;
    private _rayPathsVisible: boolean;

    rootImageSource: ImageSource | null; 
    validRayPaths: ImageSourcePath[] | null; 
    allRayPaths: ImageSourcePath[] | null; 

    constructor(params: ImageSourceSolverParams = defaults){
        super(params);
        this.uuid = uuid(); 
        this.kind = "image-source";
        this.name = params.name;
        this.roomID = params.roomID;
        this.sourceIDs = params.sourceIDs;
        this.receiverIDs = params.receiverIDs; 
        this.containers = params.containers;

        this.maxReflectionOrder = params.maxReflectionOrder; 
        this._imageSourcesVisible = params.imageSourcesVisible; 
        this._rayPathsVisible = params.rayPathsVisible; 

        this.surfaceIDs = []; 
        
        this.rootImageSource = null;
        this.allRayPaths = null;  
        this.validRayPaths = null; 

        // get room 
        let room: Room = messenger.postMessage("FETCH_ROOMS")[0][0];
        this.roomID = room.uuid; 

    }

    updateImageSourceCalculation(){

      // clear markup (replace with a more robust method eventually)
      this.clearRayPaths(); 
      this.clearImageSources(); 

      // add in checking to make sure only 1 source and 1 receiver are selected

      let is_params: ImageSourceParams = {
        baseSource: this.containers[this.sourceIDs[0]] as Source,
        position: (this.containers[this.sourceIDs[0]] as Source).position.clone(), 
        room: this.room, 
        reflector: null,
        parent: null, 
        order: 0, 
      };
      
      let is_base: ImageSource = new ImageSource(is_params);
      let is_calculated: ImageSource | null = computeImageSources(is_base,this.maxReflectionOrder); 

      this.rootImageSource = is_calculated; 

      // construct all possible paths
      let paths: ImageSourcePath[];
      let valid_paths: ImageSourcePath[] = []; 
      if(is_calculated != null){
        paths = is_calculated.constructPathsForAllDescendents(this.containers[this.receiverIDs[0]] as Receiver);

        this.allRayPaths = paths; 

        // get valid paths
        for(let i = 0; i<paths?.length; i++){
          if(paths[i].isvalid(this.room.surfaces.children as Surface[])){
            valid_paths.push(paths[i]); 
          }
        }
      }
      this.validRayPaths = valid_paths; 
      (this._imageSourcesVisible) && (this.drawImageSources());
      (this._rayPathsVisible) && (this.drawRayPaths()); 
    }

    calculateLTP(c: number){

      let sortedPath: ImageSourcePath[] | null = this.validRayPaths; 
      sortedPath?.sort((a, b) => (a.arrivalTime(c) > b.arrivalTime(c)) ? 1 : -1); 

      if(sortedPath != undefined){
        for(let i = 0; i<sortedPath?.length; i++){
          let t = sortedPath[i].arrivalTime(343); 
          let p = sortedPath[i].arrivalPressure([100],[1000]); 
          console.log("Arrival: " + (i+1) + " | Arrival Time: (s) " + t + " | Arrival Pressure(1000Hz): " + p + " | Order " + sortedPath[i].order); 
        }
      }


    }

    test(){

      // debugging

        // get source
        let source: Source = messenger.postMessage("FETCH_SOURCE",this.sourceIDs[0])[0];

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
        
        let maxOrder = 1; 
        let is_2 = computeImageSources(is,maxOrder); 
        is_2?.markup(); 
        console.log(is_2); 

        let receiver: Receiver = this.receivers[0];
        console.log(receiver);

        let paths: ImageSourcePath[];
        if(is_2 != null){
          paths = is_2.constructPathsForAllDescendents(receiver);

          let f = [125, 250, 500, 1000, 2000, 4000];
          let initialSPL = [100,100,100,100,100,100]; 

          let validCount = 0; 
          for(let i = 0; i<paths.length; i++){
            if(paths[i].isvalid(this.room.surfaces.children as Surface[])){
              paths[i].markup(); 
              console.log(paths[i]);
              console.log(paths[i].totalLength)
              console.log(paths[i].arrivalTime(343)); 
              console.log(ac.Lp2P(initialSPL));
              console.log(paths[i].arrivalPressure(initialSPL,f))
              validCount++; 
            }
          }
          console.log(validCount + " out of " + paths.length + " paths are valid"); 
        } 
    }

    // getters and setters
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
    
    get numValidRays(): number {
      let numValid = this.validRayPaths?.length; 

      if(numValid === undefined){
        return 0; 
      }else{
        return numValid; 
      }
    }

    get numTotalRays(): number {
      let numTotal = this.allRayPaths?.length;

      if(numTotal === undefined){
        return 0; 
      }else{
        return numTotal; 
      }
    }

    set rayPathsVisible(vis: boolean){
      if(vis == this._rayPathsVisible){
        // do nothing
      }else{
        if(vis){
          this.drawRayPaths(); 
        }else{
          this.clearRayPaths(); 
        }
      }
      this._rayPathsVisible = vis; 
    }

    get rayPathsVisible(){
      return this._rayPathsVisible; 
    }

    set imageSourcesVisible(vis: boolean){
      if(vis == this._imageSourcesVisible){
        // do nothing
      }else{
        if(vis){
          this.drawImageSources(); 
        }else{
          this.clearImageSources(); 
        }
      }
      this._imageSourcesVisible = vis; 
    }

    get imageSourcesVisible(){
      return this._imageSourcesVisible; 
    }

    // plot functions
    drawImageSources(){
      if(this.rootImageSource != null){
        this.rootImageSource.markup(); 
      }
    }

    clearImageSources(){
      // placeholder
      renderer.markup.clearPoints(); 
    }

    drawRayPaths(){
      if(this.validRayPaths != null){
        for(let i = 0; i<this.validRayPaths.length; i++){
          this.validRayPaths[i].markup(); 
        }
      }
    }

    clearRayPaths(){
      // placeholder
      renderer.markup.clearLines(); 
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
  // note: will return null if no valid path
  // otherwise, will return ImageSourcePath object representing path 

  let path: intersection[] = []; 
  
  let maxOrder = is.order; 

  let listenerStart: intersection = {
    point: listener.position.clone(),
    reflectingSurface: null, 
    angle: null,
  }
  path[maxOrder+1] = listenerStart; 

  let raycaster = new THREE.Raycaster(); 

  for(let order = maxOrder; order>=1; order--){
    let nextPosition: Vector3 = is.position.clone(); 
    let lastPosition: Vector3 = (path[order+1]).point.clone(); 

    let direction: Vector3 = new Vector3(0,0,0); // from current image source to last image source / receiver
    direction.subVectors(nextPosition, lastPosition);
    direction.normalize(); 

    raycaster.set(lastPosition,direction);
    let intersections; 
    if(is.reflector != null){
      intersections = raycaster.intersectObject(is.reflector.mesh,true);
    }
    
    if(intersections.length>0){
      
      let intersect: intersection = {
        point: intersections[0].point, 
        reflectingSurface: is.reflector,
        angle: direction.clone().multiplyScalar(-1).angleTo(intersections[0].face!.normal),
      };

      path[order] = intersect; 
    }else{
      return null; // no valid path
    }

    if(is.parent != null){
      is = is.parent; 
    }

  }

  let sourceEnd: intersection = {
    point: is.position.clone(),  
    reflectingSurface: null, 
    angle: null, 
  };

  path[0] = sourceEnd; 
  let pathObject = new ImageSourcePath(path); 
  return pathObject;
}

function isInFrontOf(surface1: Surface, surface2: Surface): boolean{
  // figure out how to check this
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

declare global {
  interface EventTypes {
    ADD_IMAGESOURCE: ImageSourceSolver | undefined,
    REMOVE_IMAGESOURCE: string;
    IMAGESOURCE_CLEAR_RAYS: string;
    IMAGESOURCE_SET_PROPERTY: {
      uuid: string;
      property: keyof ImageSourceSolver;
      value: ImageSourceSolver[EventTypes["IMAGESOURCE_SET_PROPERTY"]["property"]]; 
    }
    CALCULATE_IMAGESOURCE: ImageSourceSolver; 
  }
}

on("IMAGESOURCE_SET_PROPERTY", setSolverProperty);
on("REMOVE_IMAGESOURCE", removeSolver);
on("ADD_IMAGESOURCE", addSolver(ImageSourceSolver));
//on("RAYTRACER_CLEAR_RAYS", (uuid: string) => void (useSolver.getState().solvers[uuid] as ImageSourceSolver).clearRays());
