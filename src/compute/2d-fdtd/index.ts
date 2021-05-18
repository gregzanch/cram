import Renderer from "../../render/renderer";
import { on, postMessage, addMessageHandler, removeMessageHandler, messenger } from "../../messenger";
import {
  PlaneBufferGeometry,
  ShaderMaterial,
  UniformsLib,
  Mesh,
  WebGLRenderer,
  DataTexture,
  UniformsUtils,
  Color,
  DoubleSide,
  Vector2,
  IUniform,
  WebGLRenderTarget,
  ClampToEdgeWrapping,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
  Geometry,
  Vector3,
  MeshBasicMaterial,
  MeshLambertMaterial
} from "three";
import {
  GPUComputationRenderer,
  Variable
} from "three/examples/jsm/misc/GPUComputationRenderer.js";
import shaders from "./shaders";
import Solver from "../solver";
import FDTDSource from "./fdtd-source";

import Source from "../../objects/source";
import Receiver from "../../objects/receiver";
import map from "../../common/map";
import FDTDWall, { FDTDWallProps } from "./fdtd-wall";
import Surface from "../../objects/surface";
import { KeyValuePair } from "../../common/key-value-pair";
import { clamp } from "../../common/clamp";
import { EditorModes } from "../../constants";
import { addSolver, removeSolver, setSolverProperty, useContainer } from "../../store";
import { renderer } from "../../render/renderer";
import { pickProps } from "../../common/helpers";

const CELL_RESOLUTION = 256;

export const FDTD_2D_Defaults = {
  width: 10,
  height: 10,
  cellSize: 10 / CELL_RESOLUTION,
  offsetX: 0,
  offsetY: 0
};

export interface FDTD_2D_Props {
  width?: number;
  height?: number;
  cellSize?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface Uniforms {
  [uniform: string]: IUniform;
}

class FDTD_2D extends Solver {
  gpuCompute!: GPUComputationRenderer;

  /**
   * number of x cells
   */
  nx: number;

  /**
   * number of y cells
   */
  ny: number;
  
  offsetX: number;
  offsetY: number;

  uniforms!: Uniforms;
  mesh!: Mesh;
  editMesh!: Mesh;
  heightmapVariable!: Variable;
  sourcemapVariable!: Variable;
  sourcemap!: DataTexture;
  readLevelShader!: ShaderMaterial;
  readLevelImage!: Uint8Array;
  readLevelRenderTarget!: WebGLRenderTarget;
  sources!: KeyValuePair<Source>;
  sourceKeys!: string[];
  receivers!: KeyValuePair<Receiver>;
  receiverKeys!: string[];
  walls!: FDTDWall[];
  /**
   * simulation in seconds
   */
  time: number;

  /**
   * simulation time step in seconds
   */
  dt: number;
  width: number;
  height: number;
  cellSize: number;
  numPasses: number;
  waveSpeed: number;
  recording: boolean;
  clearShader!: ShaderMaterial;
  frame: number;
  messageHandlers: string[][];
  eventListeners: (()=>void)[];
  constructor(props?: FDTD_2D_Props) {
    super(props);
    this.kind = "fdtd-2d";
    this.running = false;
    this.time = 0;
    this.frame = 0;
    this.numPasses = 1;
    this.waveSpeed = 340.29;
    this.recording = false;

    const surfaces = [...useContainer.getState().selectedObjects.values()].filter(x=>x.kind==="surface") as Surface[];
    let surface: Surface|null = null;
    props = props || {};
    if (surfaces.length > 0) {
      surface = surfaces.length > 1 ? surfaces[0].mergeSurfaces(surfaces) : surfaces[0];
      const { max, min } = surface.mesh.geometry.boundingBox;
      props.width = max.x - min.x;
      props.height = max.y - min.y;
      props.offsetX = min.x;
      props.offsetY = min.y;
    }
    const _width = (props && props.width) || FDTD_2D_Defaults.width;
    const _height = (props && props.height) || FDTD_2D_Defaults.height;
    
    this.offsetX = (props && props.offsetX) || FDTD_2D_Defaults.offsetX;
    this.offsetY = (props && props.offsetY) || FDTD_2D_Defaults.offsetY;
    
    this.cellSize = (props && props.cellSize) || Math.max(_width, _height) / CELL_RESOLUTION;

    this.nx = Math.ceil(_width / this.cellSize);
    this.ny = Math.ceil(_height / this.cellSize);

    this.width = this.nx * this.cellSize;
    this.height = this.ny * this.cellSize;

    this.dt = this.cellSize / this.waveSpeed;

    this.sources = {} as KeyValuePair<Source>;
    this.sourceKeys = [] as string[];
    this.receivers = {} as KeyValuePair<Receiver>;
    this.receiverKeys = [] as string[];
    this.walls = [] as FDTDWall[];
    this.messageHandlers = [] as string[][];
    this.eventListeners = [] as (()=>void)[];

    const editGeometry = new PlaneBufferGeometry(this.width, this.height, 1, 1);
    editGeometry.translate(this.width/2, this.height/2, 0);
    editGeometry.translate(this.offsetX, this.offsetY, 0);
    const editMaterials = [
      new MeshBasicMaterial({ wireframe: true, side: DoubleSide, color: 0x707070 }),
      new MeshLambertMaterial({ transparent: true, opacity: 0.35, side: DoubleSide, color: 0x707070 })
    ];
    
    this.editMesh = new Mesh(editGeometry, editMaterials[0]);
    this.editMesh.name = "fdtd-2d-edit-mesh";
    this.editMesh.visible = false;
    
    renderer.fdtdItems.add(this.editMesh);
    

    this.fillTexture = this.fillTexture.bind(this);
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.updateWalls = this.updateWalls.bind(this);
    this.updateSourceTexture = this.updateSourceTexture.bind(this);
    this.addWallsFromSurfaceEdges = this.addWallsFromSurfaceEdges.bind(this);
    this.setWireframeVisible = this.setWireframeVisible.bind(this);
    this.getWireframeVisible = this.getWireframeVisible.bind(this);
    this.toggleWall = this.toggleWall.bind(this);
    this.clear = this.clear.bind(this);
    
    
    this.init();
    
    this.onModeChange(postMessage("GET_EDITOR_MODE")[0]);

    if(surface){
      this.addWallsFromSurfaceEdges(surface);
    }
    

  }
  onModeChange(mode: EditorModes) {
    switch (mode) {
      case EditorModes.OBJECT: { 
        this.editMesh.visible = false;
        this.mesh.visible = true;
      } break;
      case EditorModes.SKETCH: { 
        this.editMesh.visible = false;
        this.mesh.visible = false;
      } break;
      case EditorModes.EDIT: { 
        this.editMesh.visible = true;
        this.mesh.visible = false;
      } break;
      default: break;
    }
  }
  setWidth(width: number) {
    this.nx = Math.ceil(width / this.cellSize);
    this.width = this.nx * this.cellSize;
  }
  setHeight(height: number) {
    this.ny = Math.ceil(height / this.cellSize);
    this.height = this.ny * this.cellSize;
  }
  
  setDimmensions(width: number, height: number) {
    this.setWidth(width);
    this.setHeight(height);
  }
  
  init() {
    this.dispose();
    const geometry = new PlaneBufferGeometry(this.width, this.height, this.nx - 1, this.ny - 1);
    geometry.name = "fdtd-2d-plane-geometry";
    geometry.translate(this.width / 2, this.height / 2, 0);
    geometry.translate(this.offsetX, this.offsetY, 0);
    const heightmap = { value: null };
    const uniforms = UniformsUtils.merge([
      UniformsLib.common,
      UniformsLib.specularmap,
      UniformsLib.envmap,
      UniformsLib.aomap,
      UniformsLib.lightmap,
      UniformsLib.emissivemap,
      UniformsLib.bumpmap,
      UniformsLib.normalmap,
      UniformsLib.displacementmap,
      UniformsLib.gradientmap,
      UniformsLib.fog,
      UniformsLib.lights,
      {
        emissive: { value: new Color(0x000000) },
        specular: { value: new Color(0x111111) },
        shininess: { value: 30 },
        colorBrightness: { value: 10 },
        cell_size: { value: this.cellSize },
        inv_cell_size: { value: 1 / this.cellSize },
        heightmap
      }
    ]);
    const vertexShader = shaders.waterVert;
    const fragmentShader = shaders.waterFrag;
    const side = DoubleSide;
    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side,
      name: "fdtd-2d-material"
    });
    material.lights = true;

    this.uniforms = material.uniforms;
    this.mesh = new Mesh(geometry, material);

    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    // this.mesh.scale.setScalar(this.width / this.nx);
    (this.mesh.material as ShaderMaterial).wireframe = false;
    this.mesh.matrixAutoUpdate = true;
    this.mesh.scale.setZ(0.01);
    renderer.fdtdItems.add(this.mesh);

    this.gpuCompute = new GPUComputationRenderer(this.nx, this.ny, renderer.renderer as WebGLRenderer);

    let heightmapInit = this.gpuCompute.createTexture();
    this.sourcemap = this.gpuCompute.createTexture();
    this.fillSourceTexture();
    this.updateSourceTexture();
    this.fillTexture(heightmapInit);
    this.heightmapVariable = this.gpuCompute.addVariable("heightmap", shaders.heightMapFrag, heightmapInit);
    this.gpuCompute.setVariableDependencies(this.heightmapVariable, [this.heightmapVariable]);

    (this.heightmapVariable.material as ShaderMaterial).uniforms["sourcemap"] = { value: this.sourcemap };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["mousePos"] = { value: new Vector2(5, 5) };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["mouseSize"] = { value: 0.0 };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["damping"] = { value: 0.9999 };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["heightCompensation"] = { value: 0 };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["cell_size"] = { value: this.cellSize };

    (this.heightmapVariable.material as ShaderMaterial).uniforms["inv_cell_size"] = { value: 1 / this.cellSize };

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }

    this.clearShader = this.gpuCompute["createShaderMaterial"](shaders.clearFrag, { clearTexture: { value: null } });

    this.readLevelShader = this.gpuCompute["createShaderMaterial"](shaders.readLevelFrag, {
      point1: { value: new Vector2() },
      levelTexture: { value: null },
      cell_size: { value: this.cellSize },
      inv_cell_size: { value: 1 / this.cellSize }
    });

    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
    this.readLevelImage = new Uint8Array(4 * 1 * 4);

    this.readLevelRenderTarget = new WebGLRenderTarget(4, 1, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: false
    });
    

    this.eventListeners.push(on("RENDERER_UPDATED", ()=>{
      if (this.running) this.render();
    }));
    this.render();
    this.clear();
  }
  editSize() {
    // this.mesh.visible = false;
  }
  dispose() {
    this.eventListeners.forEach(dispose => dispose());

    for (let i = 0; i < this.messageHandlers.length; i++) {
      removeMessageHandler(this.messageHandlers[i][0], this.messageHandlers[i][1]); 
    }
    this.mesh && renderer.fdtdItems.remove(this.mesh);
    this.messageHandlers = [] as string[][];
  }
  run() {
    this.running = true;
    renderer.fdtd2drunning = true;
  }
  stop() {
    this.running = false;
    renderer.fdtd2drunning = false;
  }
  // save() {
  //   return pickProps(["name", "uuid", "width", "height", "offsetX", "offsetY", "cellSize"], this);
  // }
  setWireframeVisible(show: boolean) {
    (this.mesh.material as ShaderMaterial).wireframe = show;
  }
  getWireframeVisible() {
    return (this.mesh.material as ShaderMaterial).wireframe;
  }
  addSource(source: Source) {
    this.sourceKeys = [...new Set(this.sourceKeys.concat(source.uuid))];
    this.sources[source.uuid] = source;
  }
  removeSource(id: string) {
    if (this.sources[id]) {
      delete this.sources[id];
      this.sourceKeys = this.sourceKeys.filter((x) => x !== id);
    }
  }
  addReceiver(receiver: Receiver) {
    this.receiverKeys = [...new Set(this.receiverKeys.concat(receiver.uuid))];
    this.receivers[receiver.uuid] = receiver;
  }
  removeReceiver(id: string) {
    if (this.receivers[id]) {
      delete this.receivers[id];
      this.receiverKeys = this.receiverKeys.filter((x) => x !== id);
    }
  }
  addWall(props: FDTDWallProps) {
    const x1 = clamp(Math.floor((props.x1 - this.offsetX) / this.cellSize), 0, this.nx - 1);
    const y1 = clamp(Math.floor((props.y1 - this.offsetY) / this.cellSize), 0, this.nx - 1);
    const x2 = clamp(Math.floor((props.x2 - this.offsetX) / this.cellSize), 0, this.nx - 1);
    const y2 = clamp(Math.floor((props.y2 - this.offsetY) / this.cellSize), 0, this.nx - 1);
    this.walls.push(new FDTDWall({ x1, y1, x2, y2 }));
    this.updateWalls();
  }
  addWallsFromSurfaceEdges(surface: Surface) {
    const vertices = (surface.edges.geometry as Geometry).vertices as Vector3[];
    for (let i = 0; i < vertices.length; i += 2) {
      let x1 = clamp(Math.floor((vertices[i].x - this.offsetX) / this.cellSize), 0, this.nx - 1);
      let y1 = clamp(Math.floor((vertices[i].y - this.offsetY) / this.cellSize), 0, this.ny - 1);
      let x2 = clamp(Math.floor((vertices[i + 1].x - this.offsetX) / this.cellSize), 0, this.nx - 1);
      let y2 = clamp(Math.floor((vertices[i + 1].y - this.offsetY) / this.cellSize), 0, this.ny - 1);
      this.walls.push(new FDTDWall({ x1, y1, x2, y2 }));
    }
    this.updateWalls();
  }

  fillSourceTexture() {
    const pixels = this.sourcemap.image.data;
    let p = 0;
    for (let j = 0; j < this.ny; j++) {
      for (let i = 0; i < this.nx; i++) {
        const x = i / this.nx;
        const y = j / this.ny;
        const n = 3;
        pixels[p + 0] = 0;
        pixels[p + 1] = 0;
        pixels[p + 2] = 1;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  }

  toggleWall(index: number) {
    if (this.walls[index]) {
      this.walls[index].enabled = !this.walls[index].enabled;
      this.updateWalls();
    }
  }

  updateWalls() {
    for (let i = 0; i < this.walls.length; i++) {
      if (this.walls[i].shouldClearPreviousCells) {
        for (let j = 0; j < this.walls[i].previousCells.length; j++) {
          const index = 4 * (this.walls[i].previousCells[j][1] * this.nx + this.walls[i].previousCells[j][0]);
          this.sourcemap.image.data[index + 2] = 1;
        }
        this.walls[i].shouldClearPreviousCells = false;
      }
      if (this.walls[i].enabled) {
        for (let j = 0; j < this.walls[i].cells.length; j++) {
          const index = 4 * (this.walls[i].cells[j][1] * this.nx + this.walls[i].cells[j][0]);
          this.sourcemap.image.data[index + 2] = 0;
        }
      } else {
        for (let j = 0; j < this.walls[i].cells.length; j++) {
          const index = 4 * (this.walls[i].cells[j][1] * this.nx + this.walls[i].cells[j][0]);
          this.sourcemap.image.data[index + 2] = 1;
        }
      }
    }
    this.sourcemap.needsUpdate = true;
  }

  updateSourceTexture() {
    const pixels = this.sourcemap.image.data;
    for (let i = 0; i < this.sourceKeys.length; i++) {
      const x = Math.round((this.sources[this.sourceKeys[i]].x - this.offsetX) / this.cellSize);
      const y = Math.round((this.sources[this.sourceKeys[i]].y - this.offsetY) / this.cellSize);
      const index = 4 * (y * this.nx + x);
      this.sources[this.sourceKeys[i]].updateWave(this.time, this.frame, this.dt);
      const value = this.sources[this.sourceKeys[i]].value;
      const vel = this.sources[this.sourceKeys[i]].velocity;
      pixels[index + 0] = map(value, -2, 2, 0, 255);
      pixels[index + 1] = map(vel, -2, 2, 0, 255);
      pixels[index + 3] = 0;

      if (this.sources[this.sourceKeys[i]].shouldClearPreviousPosition) {
        const px = Math.round((this.sources[this.sourceKeys[i]].previousX - this.offsetX) / this.cellSize);
        const py = Math.round((this.sources[this.sourceKeys[i]].previousY - this.offsetY) / this.cellSize);
        const previndex = 4 * (py * this.nx + px);
        pixels[previndex + 0] = 0;
        pixels[previndex + 1] = 0;
        pixels[previndex + 3] = 1;
        this.sources[this.sourceKeys[i]].shouldClearPreviousPosition = false;
        this.sources[this.sourceKeys[i]].updatePreviousPosition();
      }
    }
    this.sourcemap.needsUpdate = true;
  }
  fillTexture(texture: DataTexture) {
    const pixels = texture.image.data;
    let p = 0;
    for (let j = 0; j < this.ny; j++) {
      for (let i = 0; i < this.nx; i++) {
        const x = i / this.nx;
        const y = j / this.ny;
        const n = 3;
        // const value = Math.sin(n * Math.PI * x) * Math.cos(n * Math.PI * y);
        const value = 0;

        pixels[p + 0] = map(value, -2, 2, 0, 255);
        pixels[p + 1] = 0;
        pixels[p + 2] = 1;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  }
  readReceiverLevels() {
    const currentRenderTarget = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable);
    this.readLevelShader.uniforms["levelTexture"].value = currentRenderTarget["texture"];
    for (let i = 0; i < this.receiverKeys.length; i++) {
      const key = this.receiverKeys[i];
      if (this.receivers[key]) {
        const u = (this.receivers[key].position.x - this.offsetX) / this.width;
        const v = (this.receivers[key].position.y - this.offsetY) / this.height;
        this.readLevelShader.uniforms["point1"].value.set(u, v);
        this.gpuCompute.doRenderTarget(this.readLevelShader, this.readLevelRenderTarget);
        (renderer.renderer as WebGLRenderer).readRenderTargetPixels(
          this.readLevelRenderTarget,
          0,
          0,
          4,
          1,
          this.readLevelImage
        );
        const pixels = new Float32Array(this.readLevelImage.buffer);
        const normal = [pixels[1], pixels[2]];
        const level = pixels[0];
        this.receivers[key].fdtdSamples.push((level-127.5)/127.5);
      }
    }
  }
  clear() {
    const currentRenderTarget = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable);
    const alternateRenderTarget = this.gpuCompute.getAlternateRenderTarget(this.heightmapVariable);
    this.clearShader.uniforms["clearTexture"].value = currentRenderTarget["texture"];
    this.gpuCompute.doRenderTarget(this.clearShader, alternateRenderTarget);
    this.clearShader.uniforms["clearTexture"].value = alternateRenderTarget["texture"];
    this.gpuCompute.doRenderTarget(this.clearShader, currentRenderTarget);
    this.time = 0;
    this.frame = 0;
  }
  render() {
    for (let i = 0; i < this.numPasses; i++) {
      this.updateSourceTexture();

      this.heightmapVariable.material["uniforms"]["sourcemap"].value = this.sourcemap;

      // Do the gpu computation
      this.gpuCompute.compute();

      if (this.recording) {
        for (let j = 0; j < this.sourceKeys.length; j++){
          this.sources[this.sourceKeys[j]].recordSample();
        }
        this.readReceiverLevels();
      }

      this.time += this.dt;
      this.frame += 1;
    }

    // Get compute output in custom uniform
    this.uniforms["heightmap"].value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable)["texture"];
  }
  onParameterConfigFocus() {}
  onParameterConfigBlur() {}
}

export { FDTD_2D };

export default FDTD_2D;

