import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import Surface from './surface';

export interface RoomProps extends ContainerProps {
  surfaces: Surface[];
}

export default class Room extends Container {
	constructor(name: string, props: RoomProps) {
		super(name);
		this.kind = "room";
		props.surfaces.forEach(surface => {
			this.add(surface);
		});
  }
}
