import Renderer from "../../render/renderer";
import Messenger from "../../messenger";
import { PlaneBufferGeometry, ShaderMaterial, UniformsLib, Mesh, WebGLRenderer, DataTexture, UniformsUtils, Color, CanvasTexture } from 'three';
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import shaders from './shaders';
import Solver from "../solver";
import FDTDSource from "./fdtd-source";

const TWOPI = Math.PI * 2;


export interface FDTD_2D_Props{
  messenger: Messenger;
  renderer: Renderer;
}

export interface Uniforms  {
  [uniform: string]: THREE.IUniform;
}




class FDTD_2D extends Solver {
  renderer: Renderer;
  messenger: Messenger;
  gpuCompute!: GPUComputationRenderer;

  /**
   * essentially the grid resolution
   */
  textureWidth: number;

  /**
   * the plane's width
   */
  bounds: number;
  uniforms!: Uniforms;
  mesh!: Mesh;
  heightmapVariable!: Variable;
  sourcemapVariable!: Variable;
  sourcemap!: CanvasTexture;
  sourcemapctx!: CanvasRenderingContext2D;
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
  constructor(props: FDTD_2D_Props) {
    super(props);
    this.messenger = props.messenger;
    this.renderer = props.renderer;
    this.dt = 0.25 / 1000;
    this.running = false;
    this.time = 0;
    this.textureWidth = 128;
    this.bounds = 128;
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
        x: 15,
        y: 15,
        r: 3,
        amplitude: 1,
        frequency: 1,
        phase: 1
      })
    );
    const geometry = new PlaneBufferGeometry(this.bounds, this.bounds, this.textureWidth - 1, this.textureWidth - 1);
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
        heightmap
      }
    ]);
    const vertexShader = shaders.waterVert;
    const fragmentShader = shaders.waterFrag;

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    material.lights = true;
    material.defines.WIDTH = this.textureWidth.toFixed(1);
    material.defines.BOUNDS = this.bounds.toFixed(1);

    this.uniforms = material.uniforms;
    this.mesh = new Mesh(geometry, material);

    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    this.mesh.scale.setScalar(4 / this.textureWidth);
    (this.mesh.material as ShaderMaterial).wireframe = false;
    this.mesh.matrixAutoUpdate = true;
    this.renderer.env.add(this.mesh);

    this.gpuCompute = new GPUComputationRenderer(this.textureWidth, this.textureWidth, this.renderer.renderer as WebGLRenderer);
    let heightmapInit = this.gpuCompute.createTexture();
    this.sourcemapctx = document.createElement("canvas").getContext("2d")!;
    this.sourcemapctx.canvas.width = this.textureWidth;
    this.sourcemapctx.canvas.height = this.textureWidth;
    this.sourcemapctx.clearRect(0, 0, this.sourcemapctx.canvas.width, this.sourcemapctx.canvas.height);
    this.sourcemap = new THREE.CanvasTexture(this.sourcemapctx.canvas);

    this.updateSourceTexture();
    this.fillTexture(heightmapInit);
    this.heightmapVariable = this.gpuCompute.addVariable("heightmap", shaders.heightMapFrag, heightmapInit);
    this.gpuCompute.setVariableDependencies(this.heightmapVariable, [this.heightmapVariable]);

    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["sourcemap"] = { value: this.sourcemap };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mousePos"] = { value: new THREE.Vector2(5, 5) };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mouseSize"] = { value: 0.0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["viscosityConstant"] = { value: 0.98 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["heightCompensation"] = { value: 0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).defines.BOUNDS = this.bounds.toFixed(1);

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }

    this.readWaterLevelShader = this.gpuCompute["createShaderMaterial"](shaders.readWaterLevelFrag, {
      point1: { value: new THREE.Vector2() },
      levelTexture: { value: null }
    });
    this.readWaterLevelShader.defines.WIDTH = this.textureWidth.toFixed(1);
    this.readWaterLevelShader.defines.BOUNDS = this.textureWidth.toFixed(1);

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

  updateSourceTexture() {
    this.sourcemapctx.clearRect(0, 0, this.textureWidth, this.textureWidth);
    for (let i = 0; i < this.sources.length; i++){
      this.sourcemapctx.fillStyle = this.sources[i].fillStyle;
      this.sourcemapctx.beginPath();

      this.sourcemapctx.arc(this.sources[i].x, this.sources[i].y, this.sources[i].r, 0, TWOPI);
      this.sourcemapctx.fill(); 
    }
    this.sourcemap.needsUpdate = true;

  }
  fillTexture(texture: DataTexture) {
    const pixels = texture.image.data;
    let p = 0;
    for (let j = 0; j < this.textureWidth; j++) {
      for (let i = 0; i < this.textureWidth; i++) {
        const x = i / this.textureWidth;
        const y = j / this.textureWidth;
        const n = 3;
        pixels[p + 0] = (Math.sin(n * Math.PI * x) * Math.cos(n * Math.PI * y) + 1) / 2;
        pixels[p + 1] = pixels[p + 0];
        pixels[p + 2] = 0;
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