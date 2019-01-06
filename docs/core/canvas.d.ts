import { WebGLAttributeMap, WebGLUniformMap, ShaderSource, WebGLTextureInfo } from "./webgl-extension.js";
import { WebGLRenderingObject, WebGLOrientedObject } from "./webgl-object.js";
import { MatrixStack } from "./matrix-stack.js";
import * as MV from "./MV.js";
import "./webgl-extension.js";
export declare class Canvas {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    matrixStack: MatrixStack;
    textureInfos: Array<WebGLTextureInfo>;
    objectsToDraw: Array<WebGLRenderingObject>;
    updatePipeline: Array<(c: Canvas, time?: number, deltaTime?: number) => void>;
    size: [number, number];
    constructor(canvasId: string);
    sourceByDom(vNode: string, fNode: string): {
        vertSrc: string;
        fragSrc: string;
    };
    sourceByFile(vPath: string, fPath: string): Promise<{
        vertSrc: string;
        fragSrc: string;
    }>;
    normVec2D(vec: [number, number]): [number, number];
    newObject<T extends WebGLRenderingObject>(source: ShaderSource, mode?: number, attributes?: WebGLAttributeMap, uniforms?: WebGLUniformMap, destObj?: T): WebGLRenderingObject;
    newTexture(image?: TexImageSource, level?: number, // append to the first undefined level by default
    size?: [number, number]): WebGLTextureInfo;
    render(anime?: boolean): void;
}
declare module "./canvas.js" {
    interface Canvas {
        newOrientedObject(source: ShaderSource, direction: MV.Vector3D, normal: MV.Vector3D, mode?: number, attributes?: WebGLAttributeMap, uniforms?: WebGLUniformMap): WebGLOrientedObject;
    }
}
