
import registerObjectEvents from './objects/events';
import registerSolverEvents from './compute/events';
import registerStoreEvents from './store/events';


export default function registerAllEvents(){
  registerObjectEvents();
  registerSolverEvents();
  registerStoreEvents();
}
