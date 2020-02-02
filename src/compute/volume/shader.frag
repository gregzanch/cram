
precision highp float;
precision highp int;
precision highp sampler3D;


uniform vec3 nxyz;
uniform float dx;
uniform float dt;

uniform float u_length;
uniform float u_width;
uniform float u_height;

uniform sampler3D prev;
uniform sampler3D curr;

varying vec4 v_position;
varying vec3 v_texCoord;

void main(){
    gl_FragColor = v_position/12.95;
}





