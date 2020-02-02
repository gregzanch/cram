
precision highp float;

uniform float u_length;
uniform float u_width;
uniform float u_height;

varying vec4 v_position;
varying vec3 v_texCoord;

uniform vec3 nxyz;
uniform float dx;
uniform float dt;

void main(){
    v_position = vec4(position, 1.0);
    v_texCoord = vec3(0.5,0.5,0.5);
    gl_Position = modelMatrix * projectionMatrix * viewMatrix * vec4(position, 1.0);
}
