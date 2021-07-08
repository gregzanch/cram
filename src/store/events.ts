import {on, emit} from '../messenger';
import { invoke } from '@tauri-apps/api/tauri'
import {useContainer} from './container-store';


declare global {
  interface EventTypes {
    PRINT_ROOM: undefined;
  }
}

export default function registerObjectEvents(){
  on("PRINT_ROOM", () => {
    const rooms = useContainer.getState().getRooms();
    if(rooms.length > 0){
      invoke('print_room', { room: rooms[0].save() } );
    }
  })
}

