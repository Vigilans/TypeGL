import * as MV from "./MV.js";
import { WebGLOrientedObject, WebGLRenderingObject } from "./webgl-object.js";
export declare abstract class Controller {
    obj: WebGLRenderingObject;
    speed: number;
    constructor(obj: WebGLRenderingObject, // 被托管控制的对象
    offset?: MV.Vector3D, // 初始物体中心相对于原点的偏移
    scale?: number, // 初始等比缩放比例
    rotate?: MV.Vector3D, // 三个方向旋转角（先X再Y再Z）
    speed?: number);
    T: MV.Matrix;
    R: MV.Matrix;
    S: MV.Matrix;
    abstract update(event: KeyboardEvent): void;
}
declare module "./canvas.js" {
    interface Canvas {
        controllers?: Array<Controller>;
        ctrlPointer?: number;
        readonly curCtrl?: Controller;
        bindController(obj: WebGLRenderingObject | WebGLOrientedObject, init?: {
            offset?: MV.Vector3D;
            scale?: number;
            rotate?: MV.Vector3D;
            speed?: number;
        }): Controller;
    }
}
