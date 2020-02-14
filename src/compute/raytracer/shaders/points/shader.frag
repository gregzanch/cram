varying float vColor;

void main() {
  gl_FragColor = vec4( vec3(1.0,vColor,0.0), vColor );
}