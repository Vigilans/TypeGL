precision mediump float;

uniform vec4 u_Ambient;
uniform vec4 u_Diffuse;
uniform vec4 u_Specular;
uniform float u_Attenuation;
uniform float u_Shininess;
uniform vec4 u_DiffuseColor;

uniform int u_ColorSource;

varying vec3 v_L, v_E, v_N;

void main() {
    vec3 N = v_N;
    vec3 H = normalize(v_L + v_E);

    float Kd = dot(N, v_L);
    float Ks = pow(max(dot(N, H), 0.0), u_Shininess);
    if (Kd < 0.0) {
        Ks = Kd = 0.0;
    }
    vec4 Diffuse = u_Diffuse * Kd;
    vec4 Specular = u_Specular * Ks;
    vec4 Intensity = u_Ambient + (Diffuse + Specular) * u_Attenuation;
    
    gl_FragColor = u_DiffuseColor * Intensity;
}
