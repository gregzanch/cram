varying vec4 v_normal;
varying vec3 v_offset;
varying vec4 v_p;
varying float v_amplitude;
varying float v_height;
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float map(float v, float a, float b, float c, float d){
    return c+((v-a)/(b-a))*(d-c);
}

void main() {
    
    float offset = clamp(abs(v_offset.y)-v_height,0.0,100.0)/v_amplitude;
    float amp = 2.0;
    float offmin = -amp;
    float offmax = amp;
    float mapmin = 0.0;
    float mapmax = 1.0;
    float mapped = map(offset, offmin, offmax, mapmin, mapmax);
    float hue = abs(mapped);
    float sat = map(offset, 0.0, 1.0, 0.2, 0.4);
    float val = 0.71;
    vec3 hsv = vec3(hue, sat, val);
    vec3 rgb = hsv2rgb(hsv);
    gl_FragColor = vec4(rgb, 1.0);
    // gl_FragColor = vec4(normalize(v_p.rgb),0.5); 
}