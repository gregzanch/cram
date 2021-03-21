import Solver, { SolverParams } from "../solver";
import Room from "../../objects/room";
import Surface from "../../objects/surface";
import { third_octave } from '../acoustics';
import { RT_CONSTANTS } from '../../constants/rt-constants';
import { UNITS } from "../../enums/units";
import Messenger, { on } from "../../messenger";
import { transpose } from '../../common/helpers'
import { Matrix4, Triangle, Vector3 } from "three";
import { addSolver, removeSolver, setSolverProperty, useSolver } from "../../store";
import { uuid } from "uuidv4";

export interface RT60Props extends SolverParams{
  //uuid?: string;
}

export type RT60SaveObject = {
  uuid: string;
  name: string;
  kind: "rt60";
}

const defaults = {
  name: "RT60"
};

export class RT60 extends Solver{
  public uuid; 

  constructor(props: RT60Props = defaults) {
    super(props);
    this.kind = "rt60";
    this.name = props.name || defaults.name;
    this.uuid = uuid(); 
  }
  save() {
     const { name, kind, uuid } = this;
     return {
       name,
       kind,
       uuid,
     } as RT60SaveObject;
  }
  sabine(room: Room, frequencies: number[] = third_octave) {
    const unitsConstant = RT_CONSTANTS[room.units] || RT_CONSTANTS[UNITS.METERS];
    const v = room.volumeOfMesh();
    const response = [] as number[];
    frequencies.forEach((frequency) => {
      let sum = 0;
      room.surfaces.children.forEach((surface: Surface) => {
        sum += surface.getArea() * surface.absorptionFunction(frequency);
      });
      response.push((unitsConstant * v) / sum);
    });
    return transpose([frequencies, response]);
  }
  arauPuchades(room: Room, frequencies: number[] = third_octave) {

    
    // the goal of arau puchades is to break the surfaces into components (x, y, z)
    // well do this by projecting each surface onto the planes x=0, y=0, and z=0
    // https://en.wikipedia.org/wiki/Orthographic_projection
    

    const v = room.volumeOfMesh();
    const unitsConstant = RT_CONSTANTS[room.units] || RT_CONSTANTS[UNITS.METERS];
    // prettier-ignore
    const Px = new Matrix4().fromArray([
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ].flat());

    // prettier-ignore
    const Py = new Matrix4().fromArray([
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ].flat());

    // prettier-ignore
    const Pz = new Matrix4().fromArray([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1]
    ].flat());

    // [Px, Py, Pz].map
    const planes = [Px, Py, Pz];

    const surfaces = room.surfaces.children as Surface[];
    const projectedSurfaces = surfaces.map(surface => {
      const area = surface.triangles.reduce((acc,tri) => {
        const projectedVectors = planes.map(P=>tri.map(pt => new Vector3().fromArray(pt).applyMatrix4(P)));
        // the projected areas [x,y,z] for this triangle
        const areas = projectedVectors.map(vectors=>new Triangle(...vectors).getArea());
        return acc.map((a,i)=>a+areas[i]);
      }, [0,0,0]);

      const sabines = frequencies.map(freq=>area.map(a=>surface.absorptionFunction(freq)*a));
      return { area, sabines };
    });

    const [[Ax, αx],[Ay, αy],[Az, αz]] = [0,1,2].map(i=>{
      const surfacearea = projectedSurfaces.reduce((acc, { area })=>acc + area[i], 0);
      const sabines = frequencies.map((freq,f) => projectedSurfaces.reduce((acc, { sabines })=> acc+sabines[f][i], 0));
      const alphas = sabines.map(sabine=>sabine/surfacearea);
      return [surfacearea, alphas];
    });

    const A = Ax+Ay+Az;

    return frequencies.map((freq,f)=>{
      const rt = 
      ((unitsConstant*v) / (-A * (Math.log(1-αx[f]))) ) ** (Ax/A) *
      ((unitsConstant*v) / (-A * (Math.log(1-αy[f]))) ) ** (Ay/A) *
      ((unitsConstant*v) / (-A * (Math.log(1-αz[f]))) ) ** (Az/A);
      return [freq, rt];
    });
  }

  onParameterConfigFocus() {}
  onParameterConfigBlur() {}
}

export default RT60;



// this allows for nice type checking with 'on' and 'emit' from messenger
declare global {
  interface EventTypes {
    ADD_RT60: RT60 | undefined,
    REMOVE_RT60: string,
    RT60_SET_PROPERTY: {
      uuid: string;
      property: keyof RT60;
      value: RT60[EventTypes["RT60_SET_PROPERTY"]["property"]]; 
    }
  }
}

// add event listener 
on("ADD_RT60", addSolver(RT60)); 
on("REMOVE_RT60", removeSolver); 
on("RT60_SET_PROPERTY", setSolverProperty); 

