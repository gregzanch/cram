export interface CameraStoreMeta {
  version: number;
  type: string;
  generator: string;
}

export interface ObjectStore {
  uuid: string;
  type: string;
  layers: number;
  matrix: number[];
  fov: number;
  zoom: number;
  near: number;
  far: number;
  focus: number;
  aspect: number;
  filmGauge: number;
  filmOffset: number;
}

export interface CameraStore {
  metadata: CameraStoreMeta;
  object: ObjectStore;
}
