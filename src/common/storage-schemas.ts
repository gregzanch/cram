export interface CameraStoreMeta {
  version: number;
  type: string;
  generator: string;
}

export interface ObjectStore {
  pos: number[];
  quat: number[];
  uuid: string;
  type: string;
  layers: number;
  matrix: number[];
  fov: number;
  zoom: number;
  near: number;
  far: number;
  focus: number;
  target: number[];
  aspect: number;
  filmGauge: number;
  filmOffset: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface CameraStore {
  metadata: CameraStoreMeta;
  object: ObjectStore;
}
