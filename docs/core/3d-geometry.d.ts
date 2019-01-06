import * as MV from "./MV.js";
import { WebGLAttributeMap, WebGLAttribute, WebGLUniformType, ShaderSource } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";
import { Canvas } from "./canvas.js";
export declare function createPlaneVertices(width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number): WebGLAttributeMap;
export declare function createSphereVertices(radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): WebGLAttributeMap;
export declare function bindDrawing3D<T extends any[]>(createVertices: (..._Args: T) => WebGLAttributeMap): (this: Canvas, color: string | number[], mode: "fill" | "stroke", source?: ShaderSource, center?: [number, number, number], ...args: T) => WebGLRenderingObject;
const drawFigureBindings: {
    drawPlane: (this: Canvas, color: string | number[], mode: "fill" | "stroke", source?: ShaderSource, center?: [number, number, number], width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number) => WebGLRenderingObject;
    drawSphere: (this: Canvas, color: string | number[], mode: "fill" | "stroke", source?: ShaderSource, center?: [number, number, number], radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number) => WebGLRenderingObject;
};
declare module "./canvas.js" {
    interface Canvas {
        drawFigure3D(color: string | number[], mode: "fill" | "stroke", source?: ShaderSource, center?: MV.Vector3D, attributes?: {
            [key: string]: WebGLAttribute;
        }, uniforms?: {
            [key: string]: WebGLUniformType;
        }): WebGLRenderingObject;
        drawPlane: typeof drawFigureBindings.drawPlane;
        drawSphere: typeof drawFigureBindings.drawSphere;
    }
}
export declare function lathePoints(points: Array<MV.Vector2D>, scale?: MV.Vector3D, // 放缩倍数
axis?: MV.Vector3D, // 旋转轴
startAngle?: number, // 起始角 (例如 0)
endAngle?: number, // 终止角 (例如 Math.PI * 2)
numDivisions?: number, // 这中间生成多少块
capStart?: boolean, // true 就封闭起点
capEnd?: boolean): WebGLAttributeMap;
export declare function generateNormals(model: WebGLAttributeMap, maxAngle: number): {
    position: {
        numComponents: number;
        data: number[];
    };
    texCoord: {
        numComponents: number;
        data: number[];
    };
    normal: {
        numComponents: number;
        data: number[];
    };
    indices: {
        numComponents: number;
        data: number[];
    };
};
export {};
