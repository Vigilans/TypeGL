uniform mat4 u_WorldMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform vec3 u_Lighting;

attribute vec3 a_Position;
attribute vec3 a_Normal;

varying vec3 v_N, v_L, v_E;

void main() {
    vec3 modelPos = (u_WorldMatrix * vec4(a_Position, 1.0)).xyz;
    vec3 lightPos = (vec4(u_Lighting, 1.0)).xyz;
    v_L = normalize(lightPos - modelPos);
    v_N = normalize(mat3(u_WorldMatrix) * a_Normal.xyz);
    v_E = -normalize(modelPos);

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_WorldMatrix * vec4(a_Position, 1.0);
}
