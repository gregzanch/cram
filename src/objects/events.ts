import { omit } from '../common/helpers';
import {on, emit} from '../messenger';
import { useContainer, getContainerKeys } from '../store';
import Receiver, { ReceiverSaveObject } from './receiver';
import Room, { RoomSaveObject } from './room';
import Source, { SourceSaveObject } from './source';
import Container from './container';



declare global {
  interface EventTypes {
    REMOVE_CONTAINERS: string | string[];
    RESTORE_CONTAINERS: Array<SourceSaveObject | RoomSaveObject | ReceiverSaveObject>;
  }
}

on("REMOVE_CONTAINERS", (uuids) => {
  const currentContainers = useContainer.getState().containers;
  const containers = omit(typeof uuids === "string" ? [uuids] : uuids, currentContainers);
  useContainer.getState().set((state) => {
    state.containers = containers;
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
        // {
        //   const surfaces = saveObj.surfaces.map((surfaceState: SurfaceSaveObject) => {
        //     const geometry = new THREE.BufferGeometry();
        //     if (!(surfaceState.geometry instanceof THREE.BufferGeometry)) {
        //       const geom = surfaceState.geometry as BufferGeometrySaveObject;
        //       geometry.setAttribute(
        //         "position",
        //         new THREE.BufferAttribute(
        //           new Float32Array(geom.data.attributes.position.array),
        //           geom.data.attributes.position.itemSize,
        //           geom.data.attributes.position.normalized
        //         )
        //       );
        //       geometry.setAttribute(
        //         "normals",
        //         new THREE.BufferAttribute(
        //           new Float32Array(geom.data.attributes.normals.array),
        //           geom.data.attributes.normals.itemSize,
        //           geom.data.attributes.normals.normalized
        //         )
        //       );
        //       geometry.setAttribute(
        //         "texCoords",
        //         new THREE.BufferAttribute(
        //           new Float32Array(geom.data.attributes.texCoords.array),
        //           geom.data.attributes.texCoords.itemSize,
        //           geom.data.attributes.texCoords.normalized
        //         )
        //       );
        //     }
        //     geometry.name = surfaceState.geometry.name;
        //     geometry.uuid = surfaceState.geometry.uuid;
        //     const surf = new Surface(surfaceState.name, {
        //       acousticMaterial: surfaceState.acousticMaterial,
        //       geometry
        //     });
        //     surf.visible = surfaceState.visible;
        //     surf.wireframeVisible = surfaceState.wireframeVisible;
        //     surf.displayVertexNormals = surfaceState.displayVertexNormals;
        //     surf.edgesVisible = surfaceState.edgesVisible;
        //     surf.uuid = surfaceState.uuid;
        //     surf.position.set(surfaceState.position[0], surfaceState.position[1], surfaceState.position[2]);
        //     surf.rotation.set(surfaceState.rotation[0], surfaceState.rotation[1], surfaceState.rotation[2], "XYZ");
        //     surf.scale.set(surfaceState.scale[0], surfaceState.scale[1], surfaceState.scale[2]);
        //     return surf;
        //   });
        //   // console.log(surfaces);
        //   // console.log(saveObj.surfaces);
        //   const room = new Room(saveObj.name || "room", {
        //     surfaces
        //   });
        //   cram.state.containers[room.uuid] = room;
        //   cram.state.renderer.addRoom(room);

        //   messenger.postMessage("ADDED_ROOM", room);
        // }
      default:
        break;
    }
  });
});


