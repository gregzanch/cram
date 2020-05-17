import Renderer from "../../render/renderer";
import Messenger from "../../messenger";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { uuid } from 'uuidv4';
import shaders from './shaders';
import Solver from "../solver";




export interface FDTD_2D_Props{
  messenger: Messenger;
  renderer: Renderer;
}

export interface Uniforms  {
  [uniform: string]: THREE.IUniform;
}




export class FDTD_2D extends Solver{
  renderer: Renderer;
  messenger: Messenger;
  textureWidth: number;
  bounds: number;
  bounds_half: number;
  waterUniforms!: Uniforms
  waterMesh!: THREE.Mesh;
  gpuCompute!: GPUComputationRenderer;
  heightmapVariable!: Variable;
  smoothShader!: THREE.ShaderMaterial;
  readWaterLevelShader!: THREE.ShaderMaterial;
  readWaterLevelImage!: Uint8Array;
  readWaterLevelRenderTarget!: THREE.WebGLRenderTarget;
  simplex: SimplexNoise;
  constructor(props: FDTD_2D_Props) {
    super(props);
    this.messenger = props.messenger;
    this.renderer = props.renderer;
    this.textureWidth = 128;
    this.bounds = 128;
    this.bounds_half = this.bounds * 0.5;
    this.simplex = new SimplexNoise();
    
    this.initWater = this.initWater.bind(this);
    this.fillTexture = this.fillTexture.bind(this);
    this.smoothWater = this.smoothWater.bind(this);
    this.render = this.render.bind(this);
    
    this.initWater();
    
    this.messenger.addMessageHandler("RENDERER_UPDATED", () => {
      if (this.running) {
        this.render();
      } 
    });
    
    this.running = true;
    
  }
  initWater() {
    const materialColor = 0x0040C0;
    let geometry = new THREE.PlaneBufferGeometry(this.bounds, this.bounds, this.textureWidth - 1, this.textureWidth - 1);
   
    // material: make a THREE.ShaderMaterial clone of THREE.MeshPhongMaterial, with customized vertex shader
    let material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib['phong'].uniforms, {
          heightmap: {
            value: null
          }
        }]),
      vertexShader: shaders.waterVert,
      fragmentShader: THREE.ShaderChunk['meshphong_frag']
    });
    
    material.lights = true;
    material['color'] = new THREE.Color(materialColor);
    material['specular'] = new THREE.Color(0x111111);
    material['shininess'] = 50;
    
    material.uniforms["diffuse"].value = material["color"];
    material.uniforms["specular"].value = material["specular"];
    material.uniforms["shininess"].value = Math.max(material["shininess"], 1e-4);
    material.uniforms["opacity"].value = material.opacity;
    
    material.defines.WIDTH = this.textureWidth.toFixed( 1 );
    material.defines.BOUNDS = this.bounds.toFixed( 1 );

    this.waterUniforms = material.uniforms;

    this.waterMesh = new THREE.Mesh( geometry, material );
    // this.waterMesh.rotation.x = - Math.PI / 2;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();
    this.waterMesh.scale.setScalar(4 / this.textureWidth);
    this.waterMesh.material['wireframe'] = true;
    this.waterMesh.matrixAutoUpdate = true;
    this.renderer.env.add( this.waterMesh );

    this.gpuCompute = new GPUComputationRenderer(this.textureWidth, this.textureWidth, this.renderer.renderer as THREE.WebGLRenderer);

    let heightmap0 = this.gpuCompute.createTexture();

    this.fillTexture( heightmap0 );

    this.heightmapVariable = this.gpuCompute.addVariable( "heightmap", shaders.heightMapFrag, heightmap0 );

    this.gpuCompute.setVariableDependencies( this.heightmapVariable, [ this.heightmapVariable ] );

    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mousePos"] = { value: new THREE.Vector2(5, 5) };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["mouseSize"] = { value: 10.0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["viscosityConstant"] = { value: 0.98 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).uniforms["heightCompensation"] = { value: 0 };
    (this.heightmapVariable.material as THREE.ShaderMaterial).defines.BOUNDS = this.bounds.toFixed(1);

    var error = this.gpuCompute.init();
    if ( error !== null ) {
      console.error(error);
    }
    
    this.smoothShader = this.gpuCompute['createShaderMaterial'](shaders.smoothFrag, { smoothTexture: { value: null } }) as THREE.ShaderMaterial;


    this.readWaterLevelShader = this.gpuCompute['createShaderMaterial']( shaders.readWaterLevelFrag, {
      point1: { value: new THREE.Vector2() },
      levelTexture: { value: null }
    } );
    this.readWaterLevelShader.defines.WIDTH = this.textureWidth.toFixed( 1 );
    this.readWaterLevelShader.defines.BOUNDS = this.textureWidth.toFixed(1);

    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
    this.readWaterLevelImage = new Uint8Array( 4 * 1 * 4 );

    this.readWaterLevelRenderTarget = new THREE.WebGLRenderTarget( 4, 1, {
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
  
  fillTexture( texture: THREE.DataTexture ) {
    var waterMaxHeight = 10;
    const simplex = this.simplex;
    const noise = ( x: number, y: number ) => {
      var multR = waterMaxHeight;
      var mult = 0.025;
      var r = 0;
      for (var i = 0; i < 15; i++) {
        r += multR * simplex.noise( x * mult, y * mult );
        multR *= 0.53 + 0.025 * i;
        mult *= 1.25;
      }
      return r;
    }
    var pixels = texture.image.data;
    var p = 0;
    for ( var j = 0; j < this.textureWidth; j ++ ) {
      for (var i = 0; i < this.textureWidth; i++) {
        var x = (i * 128) / this.textureWidth;
        var y = (j * 128) / this.textureWidth;
        pixels[p + 0] = noise(x, y);
        pixels[p + 1] = pixels[p + 0];
        pixels[p + 2] = 0;
        pixels[p + 3] = 1;
        p += 4;
      }
    }
  }
  smoothWater() {
    var currentRenderTarget = this.gpuCompute.getCurrentRenderTarget( this.heightmapVariable );
    var alternateRenderTarget = this.gpuCompute.getAlternateRenderTarget( this.heightmapVariable );
    for ( var i = 0; i < 10; i ++ ) {
      this.smoothShader.uniforms[ "smoothTexture" ].value = currentRenderTarget['texture'];
      this.gpuCompute.doRenderTarget( this.smoothShader, alternateRenderTarget );

      this.smoothShader.uniforms["smoothTexture"].value = alternateRenderTarget["texture"];
      this.gpuCompute.doRenderTarget(this.smoothShader, currentRenderTarget);
    }
  }
  
  render() {
    var uniforms = this.heightmapVariable.material['uniforms'];
    
    this.heightmapVariable.material
    
    // if ( mouseMoved ) {
    //   raycaster.setFromCamera( mouseCoords, camera );
    //   var intersects = raycaster.intersectObject( meshRay );
    //   if ( intersects.length > 0 ) {
    //       var point = intersects[ 0 ].point;
    //       uniforms[ "mousePos" ].value.set( point.x, point.z );
    //   } else {
    //       uniforms[ "mousePos" ].value.set( 10000, 10000 );
    //   }
    //   mouseMoved = false;
    // }

    uniforms["mousePos"].value.set(2 * Math.cos((2 * Math.PI * Date.now()) / 1000), 2 * Math.sin((2 * Math.PI * Date.now()) / 1000));

    // Do the gpu computation
    this.gpuCompute.compute();



    // Get compute output in custom uniform
    this.waterUniforms[ "heightmap" ].value = this.gpuCompute.getCurrentRenderTarget( this.heightmapVariable )['texture'];


  }

}