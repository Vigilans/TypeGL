import * as MV from "./MV.js";
import { Canvas } from "./canvas.js";
import { WebGLUniformMap, ShaderSource } from "./webgl-extension.js";
import { WebGLRenderingObject, normRgb } from "./webgl-object.js";
import { createSphereVertices } from "./3d-geometry.js";
import "./texture.js"

export class WebGLLightingObject extends WebGLRenderingObject {
    constructor(
        gl: WebGLRenderingContext, 
        intialPos: MV.Vector3D, // TODO: w = 1.0 时为有限位置， w = 0.0 时为平行光源 
        public ambient: MV.Vector4D, // 环境光
        public diffuse: MV.Vector4D, // 漫反射
        public specular: MV.Vector4D, // 镜面反射
        public distFactors: MV.Vector3D = [1, 0, 0], // 距离项因子
        drawSphere = true
    ) {
        super(gl);
        this.transform(MV.translate(...intialPos));
        if (drawSphere) {
            let vShader = this.gl.initShader(LightingShaderSource.vertSrc, this.gl.VERTEX_SHADER);
            let fShader = this.gl.initShader(LightingShaderSource.fragSrc, this.gl.FRAGMENT_SHADER);
            let program = this.gl.initProgram(vShader, fShader);
            this.programInfo = this.gl.createProgramInfo(program, this.gl.TRIANGLES);
            this.bufferInfo = this.gl.createBufferInfo(createSphereVertices(0.5, 16, 16));
            Object.assign(this.uniforms, {
                u_Color: MV.vec4(normRgb("rgb(238, 166, 74)"))
            });
        }
    }

    attenuation(obj: WebGLRenderingObject) {
        const dist = MV.distance(this.center, obj.center);
        return 1.0 / MV.sum(MV.mult([1, dist, dist*dist], this.distFactors));
    }
}

declare module "./canvas.js" {
    interface Canvas {
        bindLighting(
            initialPos: MV.Vector3D,
            ambient: MV.Vector4D,
            diffuse: MV.Vector4D,
            specular: MV.Vector4D,
            distFactors?: MV.Vector3D,
            drawSphere?: boolean
        ) : WebGLLightingObject;
        bindShadowObject(
            srcObj: WebGLRenderingObject,
            light: WebGLLightingObject
        ) : WebGLRenderingObject;
    }
}

Object.assign(Canvas.prototype, {
    bindLighting(this: Canvas,
        initialPos: MV.Vector3D,
        ambient: MV.Vector4D,
        diffuse: MV.Vector4D,
        specular: MV.Vector4D,
        distFactors: MV.Vector3D = [1, 0, 0],
        drawSphere = true
    ) {
        let light = new WebGLLightingObject(this.gl,
            initialPos, ambient, diffuse, specular, distFactors, drawSphere
        );
        this.objectsToDraw.push(light);
        this.updatePipeline.push(c => {
            for (const obj of this.objectsToDraw) {
                let uniforms = {
                    u_Lighting: light.center,
                    u_Ambient:  light.ambient,
                    u_Diffuse:  light.diffuse,
                    u_Specular: light.specular,
                    u_Shininess:  obj.uniforms.u_Shininess || 1.0, // 高光度默认为1.0
                    u_Attenuation: light.attenuation(obj),
                    u_DiffuseColor:  [1.0, 1.0, 1.0, 1.0] // DiffuseColor默认为恒等映射
                } as WebGLUniformMap;
                // 如果对象有材质属性，则光照决定其最终颜色
                for (const prop of ["u_Ambient", "u_Diffuse", "u_Specular"]) {
                    if (prop in obj.uniforms) {
                        uniforms[prop] = MV.mult(
                            <MV.Vector4D>uniforms[prop], 
                            <MV.Vector4D>obj.uniforms[prop]
                        );
                    }
                }
                // 如果对象有标准颜色，则光照起增强效果
                if (obj.uniforms.u_Color) {
                    uniforms.u_DiffuseColor = obj.uniforms.u_Color
                }
                // 如果对象有材质，则光照起增强效果
                if (obj.uniforms.u_DiffuseMap !== undefined) {
                    // 强化环境光的效果
                    uniforms.u_Ambient = MV.scale(4.0, <MV.Vector4D>uniforms.u_Ambient);
                    uniforms.u_Ambient[3] = 1.0;
                }
                Object.assign(obj.uniforms, uniforms);
            }
        });
        return light;
    },

    bindShadowObject(this: Canvas,
        srcObj: WebGLRenderingObject,
        lighting: WebGLLightingObject,
    ) {
        let shadowObj = new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(ShadowShaderSource.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(ShadowShaderSource.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);

        shadowObj.bufferInfo = srcObj.bufferInfo; // 复用Buffer
        shadowObj.programInfo = this.gl.createProgramInfo(program, this.gl.TRIANGLES);
        shadowObj.uniforms = {
            u_Color: [...normRgb("rgb(53, 53, 53)"), 0.7]
        }
        const srcIndex = this.objectsToDraw.findIndex(e => e === srcObj);
        this.objectsToDraw.splice(srcIndex, 0, shadowObj); // 将shadowObj插在srcObj前面
        this.updatePipeline.push(c => {
            const T1 = MV.translate(...lighting.center);
            const M = MV.mat4();
            M[3][3] = 0;
            M[3][1] = -1 / lighting.center[1];
            const T2 = MV.translate(...MV.negate(lighting.center));
            shadowObj.setModel(MV.mult(T1, M, T2, srcObj.worldMatrix));
        });
    }
})

export const LightingShaderSource = {
    vertSrc: `
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
    `,
    fragSrc: `
        precision mediump float;

        uniform vec4 u_Ambient;
        uniform vec4 u_Diffuse;
        uniform vec4 u_Specular;
        uniform float u_Attenuation;
        uniform float u_Shininess;
        uniform vec4 u_DiffuseColor;
        
        varying vec3 v_N, v_L, v_E;
        
        void main() {
        
            vec3  H  = normalize(v_L + v_E);
            float Kd = dot(v_N, v_L);
            float Ks = pow(max(dot(v_N, H), 0.0), u_Shininess);
        
            gl_FragColor = u_DiffuseColor * (u_Ambient);
        }
    `
};

export const ShadowShaderSource = {
    vertSrc: `
        uniform mat4 u_WorldMatrix;
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_ProjectionMatrix;
        
        attribute vec4 a_Position;
        
        void main() {
            gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_WorldMatrix * a_Position;
        }
    `,
    fragSrc:`
        precision mediump float;

        uniform vec4 u_Color;
        
        void main() {
            gl_FragColor = u_Color;
        }
    `
};
