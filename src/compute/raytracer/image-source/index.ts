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
import Messenger, { emit, messenger, on } from "../../../messenger";
import { KVP } from "../../../common/key-value-pair";
import Container from "../../../objects/container";
import Renderer from "../../../render/renderer";
import Source from "../../../objects/source";
import Receiver from "../../../objects/receiver";
import { Vector3 } from "three";
import Surface from "../../../objects/surface";
import _, { intersection } from "lodash";
import { addSolver, removeSolver, Result, ResultKind, ResultTypes, setSolverProperty, useSolver } from "../../../store";
import {Line2} from 'three/examples/jsm/lines/Line2';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial';

function createLine3(){
  const geometry = new LineGeometry();
  geometry.setPositions([0,0,0,1,1,1,4,5,7]);
  return new THREE.Line(geometry, new LineMaterial({
    linewidth: .01,

    color: 0xff0000,
    dashed: false
  }))
}

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

  public markupAllDescendents(){
    for(let i = 0; i<this.children.length; i++){
      let pos: Vector3 = this.children[i].position.clone();
      renderer.markup.addPoint([pos.x,pos.y,pos.z], [0,0,0]);
      if (this.children[i].hasChildren){
        this.children[i].markupAllDescendents(); 
      }else{
      }
    }
  }

  public markup(){
    let pos: Vector3 = this.position.clone(); 
    renderer.markup.addPoint([pos.x,pos.y,pos.z], [0,0,0]);
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

  public getChildrenOfOrder(order: number): ImageSource[]{
    let order_children: ImageSource[] = [];

    ((this.order == order) && (this.order == 0)) && order_children.push(this); 

    for(let i = 0; i<this.children.length; i++){
      if(this.children[i].order == order){
        order_children.push(this.children[i]); 
      }

      if(this.children[i].hasChildren){
        let a = this.children[i].getChildrenOfOrder(order); 
        order_children = order_children.concat(a); 
      }

    }
    return order_children; 
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
  public uuid; 
  public highlight; 
  
  constructor(path: intersection[]){
    this.path = path; 
    this.uuid = uuid(); 
    this.highlight = false; 
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
  plotOrders: number[];
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
  plotOrders: [0, 1, 2] // all paths
};

export class ImageSourceSolver extends Solver {

    sourceIDs: string[]; 
    receiverIDs: string[];
    roomID: string;
    surfaceIDs: string[];
    containers: KVP<Container>; 
    uuid: string; 
    levelTimeProgression: Result<ResultKind.LevelTimeProgression>;
    maxReflectionOrder: number; 
    
    private _imageSourcesVisible: boolean;
    private _rayPathsVisible: boolean;
    public plotOrders: number[]; 

    rootImageSource: ImageSource | null; 
    validRayPaths: ImageSourcePath[] | null; 
    allRayPaths: ImageSourcePath[] | null; 

    selectedImageSourcePath: THREE.Line;

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
        this.plotOrders = params.plotOrders; 
        this.levelTimeProgression = {
          kind: ResultKind.LevelTimeProgression, 
          data: [],
          info: {
            initialSPL: [100],
            frequency: [1000],
            maxOrder: this.maxReflectionOrder,
          },
          name: `LTP - ${this.name}`,
          uuid: uuid(),
          from: this.uuid
        };

        this.surfaceIDs = []; 
        
        this.rootImageSource = null;
        this.allRayPaths = null;  
        this.validRayPaths = null; 

        // get room 
        let room: Room = messenger.postMessage("FETCH_ROOMS")[0][0];
        this.roomID = room.uuid; 

        this.selectedImageSourcePath = createLine3();
        this.selectedImageSourcePath.computeLineDistances();
        renderer.markup.add(this.selectedImageSourcePath);

    }

    dispose(){
        renderer.markup.remove(this.selectedImageSourcePath);
        this.reset();
        emit("REMOVE_RESULT", this.levelTimeProgression.uuid);
    }

    updateSelectedImageSourcePath(imageSourcePath: ImageSourcePath){
      (this.selectedImageSourcePath.geometry as LineGeometry).setPositions(
        imageSourcePath.path.map(x=>x.point.toArray()).flat()
      );
      // (this.selectedImageSourcePath.geometry as LineGeometry).setFromPoints(
      //   imageSourcePath.path.map(x=>x.point)
      // );
      // (this.selectedImageSourcePath.geometry as LineGeometry).setDrawRange(0,imageSourcePath.path.length);
      console.log(imageSourcePath.path.map(x=>x.point.toArray()).flat());
      this.selectedImageSourcePath.computeLineDistances();
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

      this.calculateLTP(343); 
    }

    calculateLTP(c: number, consoleOutput: boolean = false){

      let sortedPath: ImageSourcePath[] | null = this.validRayPaths; 
      sortedPath?.sort((a, b) => (a.arrivalTime(c) > b.arrivalTime(c)) ? 1 : -1); 
      this.levelTimeProgression.info.maxOrder = this.maxReflectionOrder;
      this.levelTimeProgression.data = [] as ResultTypes[ResultKind.LevelTimeProgression]["data"]
      if(sortedPath != undefined){
        for(let i = 0; i<sortedPath?.length; i++){
          let t = sortedPath[i].arrivalTime(343); 
          let p = sortedPath[i].arrivalPressure(this.levelTimeProgression.info.initialSPL, this.levelTimeProgression.info.frequency); 
          if(consoleOutput){
            console.log("Arrival: " + (i+1) + " | Arrival Time: (s) " + t + " | Arrival Pressure(1000Hz): " + p + " | Order " + sortedPath[i].order); 
          }
          this.levelTimeProgression.data.push({
            time: t,
            pressure: ac.P2Lp(p) as number[],
            arrival: i+1,
            order: sortedPath[i].order,
            uuid: sortedPath[i].uuid
          })
        }
      }
      emit("UPDATE_RESULT", { uuid: this.levelTimeProgression.uuid, result: this.levelTimeProgression });
    }

    getPathsOfOrder(order: number): ImageSourcePath[]{
      let rayPathsOfOrder: ImageSourcePath[] = []; 
      if(this.validRayPaths != null){
        for(let i = 0; i<this.validRayPaths?.length; i++){
          if(this.validRayPaths[i].order == order){
            rayPathsOfOrder.push(this.validRayPaths[i]); 
          }
        }
      }
      return rayPathsOfOrder; 
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

    reset(){
      this.rootImageSource = null;
      this.allRayPaths = null;  
      this.validRayPaths = null; 
      this.plotOrders = (this.possibleOrders).map((e)=>e.value); 
      this.levelTimeProgression.data = [];
      this.clearImageSources(); 
      this.clearRayPaths(); 
      emit("UPDATE_RESULT", { uuid: this.levelTimeProgression.uuid, result: this.levelTimeProgression });
    }

    // plot functions
    drawImageSources(){
      this.clearImageSources(); 
      for(let i = 0; i<this.plotOrders.length; i++){
        let is = this.rootImageSource?.getChildrenOfOrder(this.plotOrders[i]) as ImageSource[];   
        for(let j = 0; j<is?.length; j++){
          is[j].markup(); 
        }
      }
    }

    clearImageSources(){
      // placeholder
      renderer.markup.clearPoints(); 
    }

    drawRayPaths(orders?:number[]){
      this.clearRayPaths(); 
      for(let i = 0; i<this.plotOrders.length; i++){
        let is_paths = this.getPathsOfOrder(this.plotOrders[i]) as ImageSourcePath[]; 
        for(let j = 0; j<is_paths.length; j++){
          is_paths[j].markup(); 
        }
      }
    }

    clearRayPaths(){
      // placeholder
      renderer.markup.clearLines(); 
    }

    toggleRayPathHighlight(rayPathUUID: string){
      if(this.validRayPaths != undefined){
        for(let i = 0; i<this.validRayPaths?.length; i++){
          if(rayPathUUID === this.validRayPaths[i].uuid){
            this.updateSelectedImageSourcePath(this.validRayPaths[i])
            //@ts-ignore
            console.log("WILL HIGHLIGHT RAY PATH WITH ARRIVAL SPL " + ac.P2Lp(this.validRayPaths[i].arrivalPressure([100], [1000]) as number) + " AND ARRIVAL TIME " + this.validRayPaths[i].arrivalTime(343)); 
            break;
          }
        }
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

    set maxReflectionOrderReset(o: number){
      this.maxReflectionOrder = o; 
      this.reset(); 
    }

    get maxReflectionOrderReset(){
      return this.maxReflectionOrder; 
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

    get possibleOrders(){
      type OptionType = {
        value: number;
        label: any; 
      };

      let o: OptionType[] = []; 
      for(let i = 0; i<=this.maxReflectionOrder; i++){
        let op: OptionType = {
          value: i,
          label: i.toString()
        }
        o.push(op); 
      }
      return o;
    }

    get selectedPlotOrders(){
      type OptionType = {
        value: number;
        label: any; 
      };
      let o: OptionType[] = []; 
      for(let i = 0; i<this.plotOrders.length; i++){
        let op: OptionType = {
          value: this.plotOrders[i],
          label: this.plotOrders[i].toString()
        }
        o.push(op); 
      }
      return o;
    }

    set toggleOrder(order: number){
      console.log(this.plotOrders);
      if(order > this.maxReflectionOrder){
        // do nothing
      }else if(this.plotOrders.includes(order)){
        console.log("hello")
        this.plotOrders.splice(this.plotOrders.indexOf(order), 1);
      }else{
        console.log("hello2")
        this.plotOrders.push(order); 
      }
      this.clearRayPaths(); 
      this.clearImageSources(); 
      this.drawRayPaths();
      this.drawImageSources(); 
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
    UPDATE_IMAGESOURCE: string; 
    RESET_IMAGESOURCE: string;
    CALCULATE_LTP: string; 
  }
}

on("IMAGESOURCE_SET_PROPERTY", setSolverProperty);
on("REMOVE_IMAGESOURCE", removeSolver);
on("ADD_IMAGESOURCE", addSolver(ImageSourceSolver));
on("UPDATE_IMAGESOURCE", (uuid: string) => void (useSolver.getState().solvers[uuid] as ImageSourceSolver).updateImageSourceCalculation());
on("RESET_IMAGESOURCE", (uuid: string) => void (useSolver.getState().solvers[uuid] as ImageSourceSolver).reset());
on("CALCULATE_LTP", (uuid: string) => void (useSolver.getState().solvers[uuid] as ImageSourceSolver).calculateLTP(343));