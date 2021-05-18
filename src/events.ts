
import registerObjectEvents from './objects/events';
import registerSolverEvents from './compute/events';


export default function registerAllEvents(){
  registerObjectEvents();
  registerSolverEvents();
}
