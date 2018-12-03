uniform float u_time;
uniform mat4 u_MVMatrix;
uniform mat4 u_WorldMatrix;

attribute vec4 a_Position;
//attribute vec3 a_Normal;

varying vec4 v_Position;
// varying vec3 v_Normal;

void main() {
    v_Position = u_WorldMatrix * u_MVMatrix * a_Position;
    gl_Position = v_Position;
}
