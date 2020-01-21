varying vec3 v_position;
void main() {
    gl_Position =  projectionMatrix * modelViewMatrix  * vec4(position,1.0);
    v_position = position;
}