precision mediump float;

uniform vec4 u_Ambient;
uniform vec4 u_Diffuse;
uniform vec4 u_Specular;
uniform float u_MShininess;

varying vec3 v_N, v_L, v_E;

void main() {
    vec3  H  = normalize(v_L + v_E);
    float Kd = dot(v_N, v_L);
    float Ks = pow(max(dot(v_N, H), 0.0), u_MShininess);
    if (Kd < 0.0) {
        Ks = Kd = 0.0;
    }

    gl_FragColor.rgb = (u_Ambient + u_Diffuse * Kd + u_Specular * Ks).rgb;
    gl_FragColor.a = 1.0;
}
