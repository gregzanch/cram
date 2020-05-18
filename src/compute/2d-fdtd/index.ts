import Renderer from "../../render/renderer";
import Messenger from "../../messenger";
import { PlaneBufferGeometry, ShaderMaterial, UniformsLib, Mesh, WebGLRenderer, DataTexture, UniformsUtils, Color, DoubleSide } from 'three';
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import shaders from './shaders';
import Solver from "../solver";
import FDTDSource from "./fdtd-source";
import map from '../../common/map';



const defaults = {
  width: 10,
  height: 10
};

export interface FDTD_2D_Props{
  messenger: Messenger;
  renderer: Renderer;
  width?: number;
  height?: number;
  cellsize?: number;
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
  readWaterLevelShader!: THREE.ShaderMaterial;
  readWaterLevelImage!: Uint8Array;
  readWaterLevelRenderTarget!: THREE.WebGLRenderTarget;
  sources!: FDTDSource[];
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
  cellsize: number;
  constructor(props: FDTD_2D_Props) {
    super(props);
    this.kind = "fdtd-2d";
    this.messenger = props.messenger;
    this.renderer = props.renderer;
    this.dt = 0.25 / 1000;
    this.running = false;
    this.time = 0;
    
    const _width = props.width || defaults.width;
    const _height = props.height || defaults.height;
    this.cellsize = props.cellsize || Math.max(_width,_height)/128;
    
    this.nx = Math.ceil(_width / this.cellsize);
    this.ny = Math.ceil(_height / this.cellsize);
    
    this.width = this.nx * this.cellsize;
    this.height = this.ny * this.cellsize;
    
    
    this.sources = [] as FDTDSource[];

    this.fillTexture = this.fillTexture.bind(this);
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);

    this.updateSourceTexture = this.updateSourceTexture.bind(this);
    this.init();

    this.messenger.addMessageHandler("RENDERER_UPDATED", () => {
      if (this.running) {
        this.render();
      }
    });

    this.run();
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
    this.sources.push(
      new FDTDSource({
        x: 10,
        y: 10,
        amplitude: 1,
        frequency: 50,
        phase: 0
      })
    );
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
        cell_size: { value: this.cellsize },
        inv_cell_size: { value: 1 / this.cellsize },
        heightScale: { value: 0.1 },
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
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["cell_size"] = { value: this.cellsize };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["inv_cell_size"] = { value: 1/this.cellsize };

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }

    this.readWaterLevelShader = this.gpuCompute["createShaderMaterial"](shaders.readWaterLevelFrag, {
      point1: { value: new THREE.Vector2() },
      levelTexture: { value: null },
      cell_size: { value: this.cellsize },
      inv_cell_size: { value: 1/this.cellsize}
    });


    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
    this.readWaterLevelImage = new Uint8Array(4 * 1 * 4);

    this.readWaterLevelRenderTarget = new THREE.WebGLRenderTarget(4, 1, {
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
  clearSourceTexture() {}
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
        pixels[p + 2] = 0;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  }
  updateSourceTexture() {
    const pixels = this.sourcemap.image.data;
    for (let i = 0; i < this.sources.length; i++) {
      const index = 4 * (this.sources[i].y * this.nx + this.sources[i].x);
      this.sources[i].update(this.time);
      const value = this.sources[i].value;
      const vel = this.sources[i].velocity;
      pixels[index + 0] = map(value, -10, 10, 0, 255);
      pixels[index + 1] = map(vel, -10, 10, 0, 255);
      pixels[index + 3] = 0;

      if (this.sources[i].shouldClearPreviousPosition) {
        const previndex = 4 * (this.sources[i].previousY * this.nx + this.sources[i].previousX);
        pixels[previndex + 0] = 0;
        pixels[previndex + 1] = 0;
        pixels[previndex + 3] = 1;
        this.sources[i].shouldClearPreviousPosition = false;
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

        pixels[p + 0] = map(value, -10, 10, 0, 255);
        pixels[p + 1] = 0;
        pixels[p + 2] = 1;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  }
  render() {
    this.updateSourceTexture();
    const uniforms = this.heightmapVariable.material["uniforms"];
    // uniforms["mousePos"].value.set(2 * Math.cos((2 * Math.PI * Date.now()) / 1000), 2 * Math.sin((2 * Math.PI * Date.now()) / 1000));
    uniforms["sourcemap"].value = this.sourcemap;

    // Do the gpu computation
    this.gpuCompute.compute();

    // Get compute output in custom uniform
    this.uniforms["heightmap"].value = this.gpuCompute.getCurrentRenderTarget(this.heightmapVariable)["texture"];
    this.time += this.dt;
  }
}

export {
  FDTD_2D
};

export default FDTD_2D;