#pragma glslify: noise = require(glsl-noise/simplex/2d)

void main() {
  float brightness = noise(gl_FragCoord.xy);

  gl_FragColor = vec4(vec3(brightness), 1.);
}