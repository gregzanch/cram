attribute float color;
varying float vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = 5.0*(color/4.0+0.5);
  gl_Position = projectionMatrix * mvPosition;
  
}