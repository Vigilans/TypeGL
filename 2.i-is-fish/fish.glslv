
uniform float u_time;
uniform vec4 u_Color;
uniform mat4 u_MVMatrix;
uniform mat4 u_RMatrix;

attribute vec4 a_Position;
attribute vec3 a_Normal;

varying vec4 v_Position;
// varying vec3 v_Normal;
varying vec4 v_Color;

void main() {
//   vec3 vz = normalize(worldPosition - nextPosition);
//   vec3 vx = normalize(cross(vec3(0,1,0), vz));
//   vec3 vy = cross(vz, vx);

//   mat4 orientMat = mat4(
//     vec4(vx, 0),
//     vec4(vy, 0),
//     vec4(vz, 0),
//     vec4(worldPosition, 1));

//   mat4 scaleMat = mat4(
//     vec4(scale, 0, 0, 0),
//     vec4(0, scale, 0, 0),
//     vec4(0, 0, scale, 0),
//     vec4(0, 0, 0, 1));
  
//   mat4 world = orientMat * scaleMat;
//   mat4 worldInverseTranspose = world;

//   v_Normal = (worldInverseTranspose * vec4(a_Normal, 0)).xyz;

    v_Color = u_Color;
    v_Position = u_RMatrix * u_MVMatrix * a_Position;
    gl_Position = v_Position;
}
