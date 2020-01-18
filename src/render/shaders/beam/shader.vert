uniform float amplitude;
uniform float time;
uniform float length;
uniform float width;
uniform float height;
uniform float mass;
uniform float modulus;
uniform float density;
uniform float pi;
uniform float resolution;
attribute float displacement;
varying vec4 v_normal;
varying vec3 v_offset;
varying vec4 v_p;
varying float v_amplitude;
varying float v_height;

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}      



void main() {
    vec3 dim = vec3(length,height,width);
    v_p = modelViewMatrix  * vec4(position, 1.0);
    v_normal = projectionMatrix *  modelViewMatrix  * vec4(normal, 1.0);
    float n = 4.0;
    float a = 0.0;
    float l = (n*pi/dim.x);
    vec3 rest = vec3(
        position.x*dim.x/2.0, //length
        position.y*dim.y/2.0, //height
        position.z*dim.z/2.0  //width
    );

    
        
    
    vec3 deform = vec3(rest.x, 0.0,  rest.z);
    vec3 dir = normalize(
            vec3(0.0, 1.0, 0.0)
        );
    vec3 offset = position.y < 0. ? deform-dim.y*dir : deform+dim.y*dir;
    offset.y+=displacement;
    


    
    gl_Position = projectionMatrix * modelViewMatrix  * vec4( offset.x, offset.y, offset.z, 1.0 );
    // gl_Position = projectionMatrix * modelViewMatrix  * vec4( rest.x, rest.y, rest.z, 1.0 );
    v_offset = offset;
    v_amplitude = amplitude;
    v_height = height;
}