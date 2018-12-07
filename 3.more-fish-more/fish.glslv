uniform mat4 u_MVMatrix;
uniform mat4 u_WorldMatrix;

attribute vec4 a_Position;

void main() {
    gl_Position = u_WorldMatrix * u_MVMatrix * a_Position;
}
