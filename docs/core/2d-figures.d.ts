import { Canvas } from "./canvas.js";
import { WebGLAttribute, WebGLUniformType } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";
import * as MV from "./MV.js";
export declare function createCircleVertices(center: MV.Vector2D, radius: number, mode: "fill" | "stroke"): [number, number][];
export declare function createBezierCurveVertices(points: Array<MV.Vector2D>, mode?: "fill" | "stroke"): [number, number][];
export declare function bindDrawing2D<T extends any[]>(createVertices: (..._Args: T) => MV.Vector2D[]): (this: Canvas, color: string | number[], ...args: T) => WebGLRenderingObject;
const drawFigureBindings: {
    drawTriangle: (this: Canvas, color: string | number[], points: [number, number][], mode?: "fill" | "stroke") => WebGLRenderingObject;
    drawCircle: (this: Canvas, color: string | number[], center: [number, number], radius: number, mode: "fill" | "stroke") => WebGLRenderingObject;
    drawBezierCurve: (this: Canvas, color: string | number[], points: [number, number][], mode?: "fill" | "stroke") => WebGLRenderingObject;
};
declare module "./canvas.js" {
    interface Canvas {
        setLineThickness(thickness: number): void;
        drawFigure2D(color: string | number[], mode: "fill" | "stroke", attributes?: {
            [key: string]: WebGLAttribute;
        }, uniforms?: {
            [key: string]: WebGLUniformType;
        }): WebGLRenderingObject;
        drawTriangle: typeof drawFigureBindings.drawTriangle;
        drawCircle: typeof drawFigureBindings.drawCircle;
        drawBezierCurve: typeof drawFigureBindings.drawBezierCurve;
    }
}
export {};
