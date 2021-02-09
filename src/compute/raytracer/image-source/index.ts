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
import * as THREE from "three";
import Room from "../../../objects/room";
import Messenger from "../../../messenger";
import { KVP } from "../../../common/key-value-pair";
import Container from "../../../objects/container";
import Renderer from "../../../render/renderer";
import Source from "../../../objects/source";
import { Vector3 } from "three";
import Surface from "../../../objects/surface";

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


export class ImageSource extends Solver {

    sourceIDs: string[]; 
    receiverIDs: string[];
    roomID: string;
    surfaceIDs: string[];
    renderer: Renderer;   
    containers: KVP<Container | Room>; 
    messenger: Messenger; 

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
    }

    test(){
        console.log("testing!");

        let room: Room = this.messenger.postMessage("FETCH_ROOMS")[0][0];
        this.roomID = room.uuid; 

        for (const key in this.containers) {
            if (this.containers[key].kind === "source") {
              this.sourceIDs.push(key);
            } else if (this.containers[key].kind === "receiver") {
              this.receiverIDs.push(key);
            } else if (this.containers[key].kind === "surface") {
              this.surfaceIDs.push(key);
            }
        }

        let source: Source = this.messenger.postMessage("FETCH_SOURCE",this.sourceIDs[0])[0];
        console.log(source.position.reflect(new Vector3(1,0,0))); //source.position.clone 
    }

    reflect(source: Source, surf: Surface): Vector3{

        let normal: Vector3 = surf.normal; 
        let unitNormal: Vector3 = normal.normalize();
        
        let reflection = source.position

        return new Vector3(1,1,1); //placeholder

    }

}