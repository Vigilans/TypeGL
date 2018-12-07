import * as MV from "./MV.js";
import { Canvas } from "./canvas.js";
import { WebGLUniformMap, ShaderSource } from "./webgl-extension.js";
import { WebGLRenderingObject, normRgb } from "./webgl-object.js";
import { createSphereVertices } from "./3d-geometry.js";

export const LightingShaderSource = {
    vertSrc: `
        uniform mat4 u_MVMatrix;
        uniform mat4 u_WorldMatrix;
        uniform vec3 u_Lighting;
        
        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        
        varying vec3 v_N, v_L, v_E;
        
        void main() {
            
            vec3 worldPos = (u_MVMatrix * a_Position).xyz;
            if (u_Lighting.z == 0.0) {
                v_L = normalize(u_Lighting.xyz);
            } else {
                v_L = normalize(u_Lighting).xyz - worldPos;
            }
            v_E = -normalize(worldPos);
            v_N = normalize(mat3(u_MVMatrix) * a_Normal).xyz;
        
            gl_Position = u_WorldMatrix * u_MVMatrix * a_Position;
        }                
    `,
    fragSrc: `
        precision mediump float;

        uniform vec4 u_Ambient;
        uniform vec4 u_Diffuse;
        uniform vec4 u_Specular;
        uniform float u_MShininess;
        
        varying vec3 v_N, v_L, v_E;
        
        void main() {
        
            vec3  H  = normalize(v_L + v_E);
            float Kd = max(dot(v_N, v_L), 0.0);
            float Ks = dot(v_L, v_N) > 0.0 ? pow(max(dot(v_N, H), 0.0), u_MShininess) : 0.0;
        
            gl_FragColor.rgb = (u_Ambient + u_Diffuse * Kd + u_Specular * Ks).rgb;
            gl_FragColor.a = 1.0;
        }
    `
};

export const ShadowShaderSource = {
    vertSrc: `
        uniform mat4 u_MVMatrix;
        uniform mat4 u_WorldMatrix;

        attribute vec4 a_Position;

        void main() {
            gl_Position = u_WorldMatrix * u_MVMatrix * a_Position;
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

export class WebGLLightingObject extends WebGLRenderingObject {
    constructor(
        gl: WebGLRenderingContext, 
        intialPos: MV.Vector3D, // TODO: w = 1.0 时为有限位置， w = 0.0 时为平行光源 
        public ambient: MV.Vector4D, // 环境光
        public diffuse: MV.Vector4D, // 漫反射
        public specular: MV.Vector4D, // 镜面反射
        public distFactor: MV.Vector3D, // 距离项因子
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

    distTerm(obj: WebGLRenderingObject) {
        const dist = MV.distance(this.center, obj.center);
        return MV.sum(MV.mult([1, dist, dist*dist], this.distFactor));
    }
}

declare module "./canvas.js" {
    interface Canvas {
        bindLighting(
            initialPos: MV.Vector3D,
            ambient: MV.Vector4D,
            diffuse: MV.Vector4D,
            specular: MV.Vector4D,
            distFactor: MV.Vector3D,
            drawSphere?: boolean
        );
        bindShadowObject(
            srcObj: WebGLRenderingObject,
            light: WebGLLightingObject
        );
    }
}

Object.assign(Canvas.prototype, {
    bindLighting(this: Canvas,
        initialPos: MV.Vector3D,
        ambient: MV.Vector4D,
        diffuse: MV.Vector4D,
        specular: MV.Vector4D,
        distFactor: MV.Vector3D,
        drawSphere = true
    ) {
        let light = new WebGLLightingObject(this.gl, initialPos, ambient, diffuse, specular, distFactor, drawSphere);
        this.objectsToDraw.push(light);
        this.updatePipeline.push(c => {
            for (const obj of this.objectsToDraw) {
                let u_Ambient, u_Diffuse, u_Specular;
                const distTerm = light.distTerm(obj);
                if (obj.uniforms.u_Color) {
                    // 如果对象有标准光照色，则光照起到增强效果
                    const u_Color = obj.uniforms.u_Color as MV.Vector4D;
                    u_Ambient  = MV.mult(light.ambient, u_Color); // 环境光不受距离项影响
                    u_Diffuse  = MV.scale(1 / distTerm, MV.mult(light.diffuse, u_Color));
                    u_Specular = MV.scale(1 / distTerm, MV.mult(light.specular, u_Color));
                    if (!obj.uniforms.u_MShininess) { // 如果没有设置高光度，则默认为1
                        obj.uniforms.u_MShininess = 1.0;
                    }
                } else if (["u_MAmbient", "u_MDiffuse", "u_MSpecular", "u_MShininess"].every(p => p in obj.uniforms)) {
                    // 如果对象有材质属性，则光照决定其最终颜色
                    const { u_MAmbient, u_MDiffuse, u_MSpecular } = obj.uniforms as { [k:string] : MV.Vector4D };
                    u_Ambient  = MV.mult(light.ambient, u_MAmbient); // 环境光不受距离项影响
                    u_Diffuse  = MV.scale(1 / distTerm, MV.mult(light.diffuse, u_MDiffuse));
                    u_Specular = MV.scale(1 / distTerm, MV.mult(light.specular, u_MSpecular));
                }
                Object.assign(obj.uniforms, {
                    // vertex shader
                    u_viewMatrix: MV.flatten(this.camera.worldMatrix),
                    u_Lighting: light.center,
                    // fragment shader
                    u_Ambient, u_Diffuse, u_Specular
                });
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
            shadowObj.setModelView(MV.mult(T1, M, T2, srcObj.mvMatrix));
        });
    }
})
