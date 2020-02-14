precision highp float;

uniform sampler2D map;
uniform float threshold;
varying vec2 vUv;
varying float vScale;
varying float vPressure;

// HSL to RGB Convertion helpers
vec3 HUEtoRGB(float H){
  H = mod(H,1.0);
  float R = abs(H * 6.0 - 3.0) - 1.0;
  float G = 2.0 - abs(H * 6.0 - 2.0);
  float B = 2.0 - abs(H * 6.0 - 4.0);
  return clamp(vec3(R,G,B),0.0,1.0);
}

vec3 HSLtoRGB(vec3 HSL){
  vec3 RGB = HUEtoRGB(HSL.x);
  float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
  return (RGB - 0.5) * C + HSL.z;
}

void main() {
  vec4 diffuseColor = texture2D( map, vUv );
  if(abs(vPressure)<threshold){
    discard;
  }
  if(vPressure<0.0){
    gl_FragColor = vec4(vec3(1.0,0.0,0.0), clamp(abs(vPressure),0.0,1.0));
  }
  else{
    gl_FragColor = vec4(vec3(0.0,1.0,0.0), clamp(abs(vPressure),0.0,1.0));
  }
}