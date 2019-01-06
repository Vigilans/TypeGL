uniform mat4 u_WorldMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec4 a_Position;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_WorldMatrix * a_Position;
}
