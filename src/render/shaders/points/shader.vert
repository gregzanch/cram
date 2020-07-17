attribute vec3 color;
varying vec3 vColor;
uniform float pointScale;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = pointScale;
  gl_Position = projectionMatrix * mvPosition;
  
}