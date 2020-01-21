
varying vec3 v_position;
#define black vec4(0.0,0.0,0.0,1.0)
#define trans vec4(0.0)


bool inrange(float v, float a, float b){
  return (v < b && v > a);
}

void main() {
    
    vec4 col = mod(abs(v_position.x),1.0)  ? black : trans;
    gl_FragColor = col; 
  
}