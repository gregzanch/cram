import { TessellateModifier } from "./TessellateModifier";

import Solver, { SolverParams } from "../solver";
import Room from "../../objects/room";
import Surface from "../../objects/surface";
import { third_octave, whole_octave } from "../acoustics";
import { RT_CONSTANTS } from "../../constants/rt-constants";
import { emit, on } from "../../messenger";
import { Matrix4, Mesh, Triangle, Vector3 } from "three";
import {
  addSolver,
  removeSolver,
  Result,
  ResultKind,
  ResultTypes,
  setSolverProperty,
  useAppStore,
  useContainer,
  useResult,
  useSolver
} from "../../store";
import { uuid } from "uuidv4";
import FileSaver from "file-saver";
import roundTo from "../../common/round-to";
import { throwif } from "../../common/throwif";
import { renderer } from "../../render/renderer";

export interface ARTProps extends SolverParams {
  //uuid?: string;
  // containers: KVP<Container>;
}

export type ARTSaveObject = {
  uuid: string;
  name: string;
  kind: string;
};

const defaults = {
  name: "Acoustic Radiance Transfer"
};

export class ART extends Solver {
  constructor(props: ARTProps = defaults) {
    super(props);
    this.kind = "art";
    this.name = props.name || defaults.name;
    this.uuid = uuid();
  }

  tessellate(){
    // throwif(this.rooms.length === 0, "there's no rooms to tessellate");
    const surfaces = Object.keys(this.rooms[0].surfaceMap).map(key=>this.rooms[0].surfaceMap[key]);
    const tessellateModifier = new TessellateModifier();
    // const geometries = surfaces.map(surface => tessellateModifier.modify( surface.geometry ));
    const meshes = surfaces.map(surface => new Mesh(tessellateModifier.modify( surface.geometry ), surface.wire.material));
    meshes.forEach(mesh=>{
      renderer.workspace.add(mesh);
    })
  }

  save() {
    const { name, kind, uuid } = this;
    return {
      name,
      kind,
      uuid
    } as ARTSaveObject;
  }

  restore(state: ARTSaveObject) {
    this.name = state.name;
    this.uuid = state.uuid;
    return this;
  }

  get rooms() {
    return useContainer.getState().getRooms();
  }
}

export default ART;

// this allows for nice type checking with 'on' and 'emit' from messenger
declare global {
  interface EventTypes {
    ADD_ART: ART | undefined;
    REMOVE_ART: string;
    ART_SET_PROPERTY: {
      uuid: string;
      property: keyof ART;
      value: ART[EventTypes["ART_SET_PROPERTY"]["property"]];
    };
  }
}

// add event listener
on("ADD_ART", addSolver(ART));
on("REMOVE_ART", removeSolver);
on("ART_SET_PROPERTY", setSolverProperty);
