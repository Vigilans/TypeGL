precision mediump float;

uniform vec4 u_Ambient;
uniform vec4 u_Diffuse;
uniform vec4 u_Specular;
uniform float u_Attenuation;
uniform float u_Shininess;

uniform int u_ColorSource;

uniform sampler2D u_DiffuseMap;
uniform sampler2D u_NormalMap;
varying vec2 v_TexCoord;

varying vec3 v_L, v_E, v_N;
varying vec4 v_DiffuseColor;

void main() {
    vec3 N;
    vec3 L = v_L;
    vec3 H = normalize(v_L + v_E);

    if (u_ColorSource == 1) {
        N = normalize(2.0 * texture2D(u_NormalMap, v_TexCoord).rgb - 1.0);
    } else {
        N = v_N;
    }
    float Kd = max(dot(N, L), 0.0);
    vec4 Diffuse = u_Diffuse * Kd;
    
    float Ks = pow(max(dot(N, H), 0.0), u_Shininess);
    vec4 Specular = u_Specular * Ks;
    if (dot(N, L) < 0.0) {
        Specular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    vec4 Intensity = u_Ambient + (Diffuse + Specular) * u_Attenuation;

    if (u_ColorSource == 1) {
        vec4 DiffuseColor = texture2D(u_DiffuseMap, v_TexCoord);
        gl_FragColor = DiffuseColor * pow(Intensity, vec4(0.5, 0.5, 0.5, 1));
    } else {
        gl_FragColor = v_DiffuseColor * Intensity;
    }
}
