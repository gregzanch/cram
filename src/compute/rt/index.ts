import Solver, { SolverParams } from "../solver";
import Room from "../../objects/room";
import Surface from "../../objects/surface";
import { third_octave } from '../acoustics';
export interface RT60Props extends SolverParams{
  room: Room;
}

export class RT60 extends Solver{
  room: Room;
  constructor(props: RT60Props) {
    super(props);
    this.room = props.room;
    this.kind = "rt60";
  }
  sabine(frequencies: number[] = third_octave) {
    const v = this.room.volumeOfMesh();
    const response = [] as number[];
    frequencies.forEach(frequency => {
      let sum = 0;
      this.room.surfaces.children.forEach((surface: Surface) => {
        sum += (surface.getArea() * surface.absorptionFunction(frequency));
      });
      response.push(0.161 * v / sum);
    });
    return [frequencies, response];
  }
  arauPuchades() {
    
  }
  
}

export default RT60;