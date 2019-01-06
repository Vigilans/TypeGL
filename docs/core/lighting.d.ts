import * as MV from "./MV.js";
import { WebGLRenderingObject } from "./webgl-object.js";
import "./texture.js";
export declare class WebGLLightingObject extends WebGLRenderingObject {
    ambient: MV.Vector4D;
    diffuse: MV.Vector4D;
    specular: MV.Vector4D;
    distFactors: MV.Vector3D;
    constructor(gl: WebGLRenderingContext, intialPos: MV.Vector3D, // TODO: w = 1.0 时为有限位置， w = 0.0 时为平行光源 
    ambient: MV.Vector4D, // 环境光
    diffuse: MV.Vector4D, // 漫反射
    specular: MV.Vector4D, // 镜面反射
    distFactors?: MV.Vector3D, // 距离项因子
    drawSphere?: boolean);
    attenuation(obj: WebGLRenderingObject): number;
}
declare module "./canvas.js" {
    interface Canvas {
        bindLighting(option: {
            initialPos: MV.Vector3D;
            ambient: MV.Vector4D;
            diffuse: MV.Vector4D;
            specular: MV.Vector4D;
            distFactors?: MV.Vector3D;
            drawSphere?: boolean;
        }): WebGLLightingObject;
        bindShadowObject(srcObj: WebGLRenderingObject, light: WebGLLightingObject): WebGLRenderingObject;
    }
}
export declare const LightingShaderSource: {
    vertSrc: string;
    fragSrc: string;
};
export declare const ShadowShaderSource: {
    vertSrc: string;
    fragSrc: string;
};
