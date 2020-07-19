import Solver, { SolverParams } from "../solver";
import Room from "../../objects/room";
import Surface from "../../objects/surface";
import { third_octave } from '../acoustics';
import { RT_CONSTANTS } from '../../constants/rt-constants';
import { UNITS } from "../../enums/units";
import Messenger from "../../state/messenger";

export interface RT60Props extends SolverParams{
  uuid?: string;
}

const defaults = {
  name: "RT60"
};

export class RT60 extends Solver{
  constructor(props: RT60Props) {
    super(props);
    this.kind = "rt60";
    this.name = props.name || defaults.name;
    props.uuid && (this.uuid = props.uuid);
  }
  save() {
     const { name, kind, uuid } = this;
     return {
       name,
       kind,
       uuid,
     };
  }
  sabine(room: Room, frequencies: number[] = third_octave) {
      const unitsConstant = RT_CONSTANTS[room.units] || RT_CONSTANTS[UNITS.METERS];
      const v = room.volumeOfMesh();
      const response = [] as number[];
      frequencies.forEach(frequency => {
        let sum = 0;
        room.surfaces.children.forEach((surface: Surface) => {
          sum += (surface.getArea() * surface.absorptionFunction(frequency));
        });
        response.push((unitsConstant * v) / sum);
      });
      return [frequencies, response];
  }
  arauPuchades() {
    
  }
  onParameterConfigFocus() {}
  onParameterConfigBlur() {}
}

export default RT60;