import * as MV from "./MV.js";
import { WebGLRenderingObject } from "./webgl-object.js";
export declare function trackballView(x: number, y: number): [number, number, number];
export declare class Trackball {
    speed: number;
    focusType: "object" | "void";
    reserveAfterStop: boolean;
    mode: "rotate" | "zoom" | "pan";
    trackingMouse: boolean;
    lastPlanePos: MV.Vector2D;
    lastBallPos: MV.Vector3D;
    rAxis: MV.Vector3D;
    rAngle: number;
    tOffset: MV.Vector3D;
    constructor(speed?: number, focusType?: "object" | "void", reserveAfterStop?: boolean);
    reset(): void;
    startRecord(x?: number, y?: number): void;
    stopRecord(): void;
}
export declare class Camera {
    perspective: MV.Matrix;
    focusObj?: WebGLRenderingObject;
    position: MV.Vector3D;
    up: MV.Vector3D;
    trackball: Trackball;
    transMatrix: MV.Matrix;
    focusBallCenter?: MV.Vector3D;
    focusBallRadius?: number;
    constructor(perspective: MV.Matrix, // 视角矩阵
    focusObj?: WebGLRenderingObject, // focusObj: 当前聚焦的对象，决定了摄像机的聚焦模式
    position?: MV.Vector3D, // Camera所处的位置，是Trackball的积累效应
    up?: MV.Vector3D, // Camera的上头位置
    updateSpeed?: number);
    readonly center: [number, number, number];
    readonly orientation: [number, number, number];
    readonly sideAxis: [number, number, number];
    readonly viewMatrix: MV.Matrix;
    readonly projectionMatrix: MV.Matrix;
    updatePosition(): void;
    mouseMotion(x: number, y: number): void;
    wheelMotion(deltaY: number): void;
}
declare module "./canvas.js" {
    interface Canvas {
        camera?: Camera;
        bindCamera(fovy: number, focusObj?: WebGLRenderingObject, initialPos?: MV.Vector3D, updateSpeed?: number): void;
    }
}
