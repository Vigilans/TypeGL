precision mediump float;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

varying vec4 v_Color;
varying vec4 v_Position;

void main() {
    gl_FragColor = vec4(rand(v_Position.xy), rand(v_Position.xy) / 3.0, 1.0 - rand(v_Position.xy), 1.0);
}
