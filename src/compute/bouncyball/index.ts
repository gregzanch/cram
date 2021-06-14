import * as THREE from "three";
import { Vector3 } from "three";
import { uuid } from "uuidv4";
import { cramangle2threejsangle } from "../../common/dir-angle-conversions";
import { emit, on } from "../../messenger";
import { Surface , Source, Room } from "../../objects";
import Container, { getContainersOfKind } from "../../objects/container";
import { renderer } from "../../render/renderer";
import { addContainer, addSolver, setSolverProperty, useContainer, useSolver } from "../../store";
import Solver from "../solver";
import { BouncyBall } from "./BouncyBall";

export interface BouncyBallSolverParams {
    name: string;
    uuid?: string;
    roomID: string;
    sourceIDs: string[];
}
  
const defaults = {
    name: "Bouncy Ball Visualization",
    roomID: "",
    sourceIDs: [] as string[],
};

export type BouncyBallSaveObject = {
    name: string;
    kind: "bouncy-ball-solver";
    uuid: string;
    roomID: string;
    sourceIDs: string[];
}

export class BouncyBallSolver extends Solver {

    uuid: string; 
    sourceIDs: string[];
    roomID: string;

    total_number_balls: number; 
    public distance_per_frame: number; 
    public framerate: number; 

    intersectableObjects: Array<THREE.Mesh | THREE.Object3D | Container>;

    bouncy_ball_uuids: string[];

    constructor(params: BouncyBallSolverParams = defaults){
        super(params);

        this.uuid = params.uuid || uuid(); 
        this.kind = "bouncy-ball-solver";
        this.name = params.name;

        this.roomID = ""; 
        for (const key in useContainer.getState().containers) {
          if (useContainer.getState().containers[key].kind === "room") {
            this.roomID = key;
          }
        }

        this.sourceIDs = params.sourceIDs;

        this.total_number_balls = 1; 
        this.distance_per_frame = 0.1;
        this.framerate = 30; 

        this.intersectableObjects = [] as Array<THREE.Mesh | THREE.Object3D | Container>;
        this.mapIntersectableObjects(); 

        console.log(this.intersectableObjects)
        
        this.bouncy_ball_uuids = [];
    }

    mapIntersectableObjects() {
        function mapSurfaces(container: Container, surfaces: THREE.Mesh[] = [] as THREE.Mesh[]) {
          if (container instanceof Surface) {
            surfaces.push(container.mesh);
          } else {
            container.children.forEach((x: Container) => {
              mapSurfaces(x, surfaces);
            });
          }
          return surfaces;
        }
        
        let room = useContainer.getState().containers[this.roomID] as Room; 
        this.intersectableObjects = mapSurfaces(room.surfaces);
    }

    start(){

        for(let i = 0; i<this.total_number_balls; i++){
            // random theta within the sources theta limits (0 to 180)
            const theta = Math.random() * (useContainer.getState().containers[this.sourceIDs[0]] as Source).theta;

            // random phi within the sources phi limits (0 to 360)
            const phi = Math.random() * (useContainer.getState().containers[this.sourceIDs[0]] as Source).phi;

            // random direction
            let threeJSAngles: number[] = cramangle2threejsangle(phi, theta); // [phi, theta]
            const direction = new Vector3().setFromSphericalCoords(1, threeJSAngles[0], threeJSAngles[1]);

            let b = new BouncyBall(useContainer.getState().containers[this.sourceIDs[0]] as Source, direction.normalize(), this.intersectableObjects)
            this.bouncy_ball_uuids.push(b.uuid);

            emit("ADD_BOUNCYBALL", b);
        }

        // let uuid = b.uuid
        let distance = this.distance_per_frame; 
        let bb_array = this.bouncy_ball_uuids; 
        let intlist = this.intersectableObjects;

        setInterval(function(){ 
            for(let i = 0; i<bb_array.length; i++){
                useContainer.getState().set(store => {
                    let bb = store.containers[bb_array[i]] as BouncyBall
                    bb.step(distance); 
                });
            }
        }, (1/this.framerate)*1000)
    }
    
}

declare global {
    interface EventTypes {
      ADD_BOUNCYBALLSOLVER: BouncyBallSolver | undefined,
      BOUNCYBALLSOLVER_SET_PROPERTY: {
        uuid: string;
        property: keyof BouncyBallSolver;
        value: BouncyBallSolver[EventTypes["BOUNCYBALLSOLVER_SET_PROPERTY"]["property"]]; 
      }
      START_BOUNCYBALL: string,
      ADD_BOUNCYBALL: BouncyBall | undefined 
    }
}

on("ADD_BOUNCYBALL", addContainer(BouncyBall));
on("ADD_BOUNCYBALLSOLVER", addSolver(BouncyBallSolver))
on("BOUNCYBALLSOLVER_SET_PROPERTY", setSolverProperty);
on("START_BOUNCYBALL", (uuid: string) => void (useSolver.getState().solvers[uuid] as BouncyBallSolver).start());