import Renderer from "../../render/renderer";
import Messenger from "../../messenger";
import { PlaneBufferGeometry, ShaderMaterial, UniformsLib, Mesh, WebGLRenderer, DataTexture, UniformsUtils, Color, DoubleSide } from 'three';
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import shaders from './shaders';
import Solver from "../solver";
import FDTDSource from "./fdtd-source";

import Source from "../../objects/source";
import Receiver from "../../objects/receiver";
import map from '../../common/map';
import FDTDWall, { FDTDWallProps } from "./fdtd-wall";
import Surface from "../../objects/surface";
import { KeyValuePair } from "../../common/key-value-pair";



export const FDTD_2D_Defaults = {
  width: 10,
  height: 10,
  cellSize: 10/128
};

export interface FDTD_2D_Props{
  messenger: Messenger;
  renderer: Renderer;
  width?: number;
  height?: number;
  cellSize?: number;
}

export interface Uniforms  {
  [uniform: string]: THREE.IUniform;
}




class FDTD_2D extends Solver {
  renderer: Renderer;
  messenger: Messenger;
  gpuCompute!: GPUComputationRenderer;

  /**
   * number of x cells
   */
  nx: number;

  /**
   * number of y cells
   */
  ny: number;

  uniforms!: Uniforms;
  mesh!: Mesh;
  heightmapVariable!: Variable;
  sourcemapVariable!: Variable;
  sourcemap!: DataTexture;
  readLevelShader!: THREE.ShaderMaterial;
  readLevelImage!: Uint8Array;
  readLevelRenderTarget!: THREE.WebGLRenderTarget;
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
  constructor(props: FDTD_2D_Props) {
    super(props);
    this.kind = "fdtd-2d";
    this.messenger = props.messenger;
    this.renderer = props.renderer;
    this.running = false;
    this.time = 0;
    this.numPasses = 1;
    this.waveSpeed = 340.29;
    this.recording = false;

    const _width = props.width || FDTD_2D_Defaults.width;
    const _height = props.height || FDTD_2D_Defaults.height;
    this.cellSize = props.cellSize || Math.max(_width, _height) / 128;

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

    this.fillTexture = this.fillTexture.bind(this);
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.updateWalls = this.updateWalls.bind(this);
    this.updateSourceTexture = this.updateSourceTexture.bind(this);
    this.addWallsFromSurfaceEdges = this.addWallsFromSurfaceEdges.bind(this);
    this.init();

    this.messenger.addMessageHandler("RENDERER_UPDATED", () => {
      if (this.running) {
        this.render();
      }
    });

    // this.run();
  }
  run() {
    this.running = true;
    this.renderer.fdtdrunning = true;
  }
  stop() {
    this.running = false;
    this.renderer.fdtdrunning = false;
  }
  init() {
    const geometry = new PlaneBufferGeometry(this.width, this.height, this.nx - 1, this.ny - 1);
    const { common, specularmap, envmap, aomap, lightmap, fog } = UniformsLib;
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
    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, side });
    material.lights = true;

    this.uniforms = material.uniforms;
    this.mesh = new Mesh(geometry, material);

    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    // this.mesh.scale.setScalar(this.width / this.nx);
    (this.mesh.material as ShaderMaterial).wireframe = false;
    this.mesh.matrixAutoUpdate = true;
    this.mesh.position.setX(this.width / 2);
    this.mesh.position.setY(this.height / 2);
    this.renderer.env.add(this.mesh);

    this.gpuCompute = new GPUComputationRenderer(this.nx, this.ny, this.renderer.renderer as WebGLRenderer);
    let heightmapInit = this.gpuCompute.createTexture();
    this.sourcemap = this.gpuCompute.createTexture();
    this.fillSourceTexture();
    this.updateSourceTexture();
    this.fillTexture(heightmapInit);
    this.heightmapVariable = this.gpuCompute.addVariable("heightmap", shaders.heightMapFrag, heightmapInit);
    this.gpuCompute.setVariableDependencies(this.heightmapVariable, [this.heightmapVariable]);

    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["sourcemap"] = { value: this.sourcemap };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mousePos"] = { value: new THREE.Vector2(5, 5) };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mouseSize"] = { value: 0.0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["damping"] = { value: 0.9999 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["heightCompensation"] = { value: 0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["cell_size"] = { value: this.cellSize };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["inv_cell_size"] = { value: 1 / this.cellSize };

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }

    this.readLevelShader = this.gpuCompute["createShaderMaterial"](shaders.readLevelFrag, {
      point1: { value: new THREE.Vector2() },
      levelTexture: { value: null },
      cell_size: { value: this.cellSize },
      inv_cell_size: { value: 1 / this.cellSize }
    });

    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
    this.readLevelImage = new Uint8Array(4 * 1 * 4);

    this.readLevelRenderTarget = new THREE.WebGLRenderTarget(4, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: false
    });
  }
  addSource(source: Source) {
    this.sourceKeys = [...new Set(this.sourceKeys.concat(source.uuid))];
    this.sources[source.uuid] = source;
  }
  addReceiver(receiver: Receiver) {
    this.receiverKeys = [...new Set(this.receiverKeys.concat(receiver.uuid))];
    this.receivers[receiver.uuid] = receiver;
  }
  addWall(props: FDTDWallProps) {
    const x1 = Math.round(props.x1 / this.cellSize);
    const y1 = Math.round(props.y1 / this.cellSize);
    const x2 = Math.round(props.x2 / this.cellSize);
    const y2 = Math.round(props.y2 / this.cellSize);
    this.walls.push(new FDTDWall({ x1, y1, x2, y2 }));
    this.updateWalls();
  }
  addWallsFromSurfaceEdges(surface: Surface) {
    const vertices = (surface.edges.geometry as THREE.Geometry).vertices as THREE.Vector3[];
    for (let i = 0; i < vertices.length; i += 2) {
      const x1 = Math.round(vertices[i].x / this.cellSize);
      const y1 = Math.round(vertices[i].y / this.cellSize);
      const x2 = Math.round(vertices[i + 1].x / this.cellSize);
      const y2 = Math.round(vertices[i + 1].y / this.cellSize);
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

  updateWalls() {
    for (let i = 0; i < this.walls.length; i++) {
      if (this.walls[i].shouldClearPreviousCells) {
        for (let j = 0; j < this.walls[i].previousCells.length; j++) {
          const index = 4 * (this.walls[i].previousCells[j][1] * this.nx + this.walls[i].previousCells[j][0]);
          this.sourcemap.image.data[index + 2] = 1;
        }
        this.walls[i].shouldClearPreviousCells = false;
      }
      for (let j = 0; j < this.walls[i].cells.length; j++) {
        const index = 4 * (this.walls[i].cells[j][1] * this.nx + this.walls[i].cells[j][0]);
        this.sourcemap.image.data[index + 2] = 0;
      }
    }
    this.sourcemap.needsUpdate = true;
  }

  updateSourceTexture() {
    const pixels = this.sourcemap.image.data;
    for (let i = 0; i < this.sourceKeys.length; i++) {
      const x = Math.round(this.sources[this.sourceKeys[i]].x / this.cellSize);
      const y = Math.round(this.sources[this.sourceKeys[i]].y / this.cellSize);
      const index = 4 * (y * this.nx + x);
      this.sources[this.sourceKeys[i]].updateWave(this.time);
      const value = this.sources[this.sourceKeys[i]].value;
      const vel = this.sources[this.sourceKeys[i]].velocity;
      pixels[index + 0] = map(value, -2, 2, 0, 255);
      pixels[index + 1] = map(vel, -2, 2, 0, 255);
      pixels[index + 3] = 0;

      if (this.sources[this.sourceKeys[i]].shouldClearPreviousPosition) {
        const px = Math.round(this.sources[this.sourceKeys[i]].previousX / this.cellSize);
        const py = Math.round(this.sources[this.sourceKeys[i]].previousY / this.cellSize);
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
    var currentRenderTarget = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable);
    this.readLevelShader.uniforms["levelTexture"].value = currentRenderTarget['texture'];
    for (var i = 0; i < this.receiverKeys.length; i++) {
      const key = this.receiverKeys[i];
      if (this.receivers[key]) {
        var u = this.receivers[key].position.x / this.width;
        var v = this.receivers[key].position.y / this.height;
        this.readLevelShader.uniforms["point1"].value.set(u, v);
        this.gpuCompute.doRenderTarget(this.readLevelShader, this.readLevelRenderTarget);
        (this.renderer.renderer as WebGLRenderer).readRenderTargetPixels(this.readLevelRenderTarget, 0, 0, 4, 1, this.readLevelImage);
        var pixels = new Float32Array(this.readLevelImage.buffer);
        const normal = [pixels[1], pixels[2]]
        const level = pixels[0];
        this.receivers[key].fdtdSamples.push(level);
      }
    }
  }
  smoothWater() {
  //   var currentRenderTarget = gpuCompute.getCurrentRenderTarget( heightmapVariable );
  //   var alternateRenderTarget = gpuCompute.getAlternateRenderTarget( heightmapVariable );
  //   for ( var i = 0; i < 10; i ++ ) {
  //     smoothShader.uniforms[ "smoothTexture" ].value = currentRenderTarget.texture;
  //     gpuCompute.doRenderTarget( smoothShader, alternateRenderTarget );

  //     smoothShader.uniforms[ "smoothTexture" ].value = alternateRenderTarget.texture;
  //     gpuCompute.doRenderTarget( smoothShader, currentRenderTarget );
  //   }
  }
  render() {
    for (let i = 0; i < this.numPasses; i++) {
      this.updateSourceTexture();

      this.heightmapVariable.material["uniforms"]["sourcemap"].value = this.sourcemap;

      // Do the gpu computation
      this.gpuCompute.compute();
      
      if (this.recording) {
        this.readReceiverLevels();
      }

      this.time += this.dt;
    }

    // Get compute output in custom uniform
    this.uniforms["heightmap"].value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable)["texture"];
  }
}

export {
  FDTD_2D
};

export default FDTD_2D;