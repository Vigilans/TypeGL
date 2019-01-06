import { WebGLProgramInfo, WebGLBufferInfo, WebGLUniformMap } from "./webgl-extension";
import * as MV from "./MV.js";
export declare class WebGLRenderingObject {
    readonly gl: WebGLRenderingContext;
    programInfo: WebGLProgramInfo;
    bufferInfo: WebGLBufferInfo;
    uniforms: WebGLUniformMap;
    worldMatrix: MV.Matrix;
    center: MV.Vector3D;
    constructor(gl: WebGLRenderingContext);
    setModel(m: MV.Matrix): void;
    transform(m: MV.Matrix): void;
    draw(): void;
}
export declare class WebGLOrientedObject extends WebGLRenderingObject {
    initDir: MV.Vector3D;
    initNorm: MV.Vector3D;
    constructor(gl: WebGLRenderingContext, initDir: MV.Vector3D, initNorm: MV.Vector3D);
    initSideAxis: MV.Vector3D;
    direction: MV.Vector3D;
    normal: MV.Vector3D;
    readonly sideAxis: [number, number, number];
    readonly coordSystem: [MV.Vector3D, MV.Vector3D, MV.Vector3D];
    setModel(m: MV.Matrix): void;
    transform(m: MV.Matrix): void;
}
export declare function normRgb(rgb: number[] | string): number[];
