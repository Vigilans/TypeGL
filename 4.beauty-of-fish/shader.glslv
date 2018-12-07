uniform mat4 u_MVMatrix;
uniform mat4 u_WorldMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_Lighting;

attribute vec3 a_Position;
attribute vec3 a_Normal;

varying vec3 v_N, v_L, v_E;

void main() {
    vec3 modelPos = (u_MVMatrix * vec4(a_Position, 1.0)).xyz;
    vec3 lightPos = (vec4(u_Lighting, 1.0)).xyz;
    v_L = normalize(lightPos - modelPos);
    v_N = normalize(mat3(u_MVMatrix) * a_Normal.xyz);
    v_E = -normalize(modelPos);

    gl_Position = u_WorldMatrix * u_MVMatrix * vec4(a_Position, 1.0);
}
