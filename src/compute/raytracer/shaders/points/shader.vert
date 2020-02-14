attribute vec2 color;
varying vec2 vColor;
uniform float pointScale;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = pointScale*(color.x/4.0+0.5);
  gl_Position = projectionMatrix * mvPosition;
  
}