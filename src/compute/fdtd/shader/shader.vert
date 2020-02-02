precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

uniform float gain;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 translate;

varying vec2 vUv;
varying float vScale;

attribute float pressure;
varying float vPressure;


float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}



void main() {
  vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
  vec3 ran = vec3(rand(translate.xy),rand(translate.xz),rand(translate.yz));
  vec3 trTime = ran+translate;
  float scale = abs(pressure) * 10.0;
  vScale = scale;
  scale = clamp(scale * gain + 10.0,0.0,100.0);
  mvPosition.xyz += position * scale;
  vUv = uv;
  vPressure = pressure;
  gl_Position = projectionMatrix * mvPosition;

}