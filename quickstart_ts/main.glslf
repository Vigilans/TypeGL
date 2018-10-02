// /*
//     Created from glsl.main snippt by glsl-canvas vscode extension
// */

// /* Main function, uniforms & utils */
// #ifdef GL_ES
//     precision mediump float;
// #endif

// uniform vec2 u_resolution;
// uniform vec2 u_mouse;
// uniform float u_time;

// #define PI_TWO			1.570796326794897
// #define PI				3.141592653589793
// #define TWO_PI			6.283185307179586

// /* Coordinate and unit utils */
// vec2 coord(in vec2 p) {
//     p = p / u_resolution.xy;
//     // correct aspect ratio
//     if (u_resolution.x > u_resolution.y) {
//         p.x *= u_resolution.x / u_resolution.y;
//         p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
//     } else {
//         p.y *= u_resolution.y / u_resolution.x;
//         p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
//     }
//     // centering
//     p -= 0.5;
//     p *= vec2(-1.0, 1.0);
//     return p;
// }
// #define rx 1.0 / min(u_resolution.x, u_resolution.y)
// #define uv gl_FragCoord.xy / u_resolution.xy
// #define st coord(gl_FragCoord.xy)
// #define mx coord(u_mouse)

// void main() {
//     vec3 color = vec3(
//         abs(cos(st.x + mx.x)), 
//         abs(sin(st.y + mx.y)), 
//         abs(sin(u_time))
//     );

//     gl_FragColor = vec4(color, 1.0);
// }
precision mediump float;

uniform sampler2D colorMap;
varying vec2 vTexCoords;

void main()
{
    gl_FragColor = texture2D(colorMap, vTexCoords);
}
