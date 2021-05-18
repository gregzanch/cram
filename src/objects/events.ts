import { omit } from '../common/helpers';
import {on, emit} from '../messenger';
import { useContainer, getContainerKeys } from '../store';
import Receiver, { ReceiverSaveObject } from './receiver';
import Room, { RoomSaveObject } from './room';
import Source, { SourceSaveObject } from './source';
import Container from './container';
import hotkeys from 'hotkeys-js';



declare global {
  interface EventTypes {
    REMOVE_CONTAINERS: string | string[];
    RESTORE_CONTAINERS: Array<SourceSaveObject | RoomSaveObject | ReceiverSaveObject>;
    DESELECT_ALL_OBJECTS: undefined;
    SET_SELECTION: Container[];
    APPEND_SELECTION: Container[];
  }
}

export default function registerObjectEvents(){
on("REMOVE_CONTAINERS", (uuids) => {
  const containers = useContainer.getState().containers;
  const ids = typeof uuids === "string" ? [uuids] : uuids;
  ids.forEach(id => containers[id].dispose());
  useContainer.getState().set((state) => {
    state.containers = omit(ids, containers);
  });
});


const restore = <ContainerType extends Container>(
  constructor: new () => ContainerType,
  saveObject: any
) => {
  return new constructor().restore(saveObject);
}

on("RESTORE_CONTAINERS", (containers) => {
  emit("REMOVE_CONTAINERS", getContainerKeys());

  containers.forEach((container) => {
    switch (container.kind) {
      case "source":
        emit("ADD_SOURCE", restore(Source, container));
        break;
      case "receiver":
        emit("ADD_RECEIVER", restore(Receiver, container));
        break;
      case "room":
        emit("ADD_ROOM", restore(Room, container));
        break;
      default:
        break;
    }
  });
});


on("DESELECT_ALL_OBJECTS", () => {
  useContainer.getState().set(state => {
    Object.keys(state.containers).forEach((uuid) => {
      state.containers[uuid].deselect();
    });
    state.selectedObjects.clear();
  });
});



on("SET_SELECTION", (containers) => {
  useContainer.getState().set(state => {
    for(const container of state.selectedObjects) container.deselect();
    state.selectedObjects.clear();
    containers.forEach(container=>{
      container.select();
      state.selectedObjects.add(container);
    })
  });
  hotkeys.setScope("EDITOR");
});

on("APPEND_SELECTION", (containers) => {
  hotkeys.setScope("EDITOR");
  useContainer.getState().set(state=>{
    containers.forEach(container=>{
      container.select();
      state.selectedObjects.add(container);
    })
  });
});

}