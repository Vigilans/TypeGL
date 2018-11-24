import * as MV from "./MV.js";
import { Canvas, WebGLOrientedObject } from "./canvas.js";

export class Controller {

    constructor(
        public obj: WebGLOrientedObject, // 被托管控制的对象
        public offset: MV.Vector3D = [0, 0, 0], // 物体中心相对于原点的偏移
        public scale:  number = 0.0, // 等比缩放比例
        public speed:  number = 1.0  // 变化速度 
    ) {
        
    }
    
    public R: MV.Matrix = MV.mat4(); // 旋转矩阵的累积
}

declare module "./canvas.js" {
    interface Canvas {
        controllers?: Array<Controller>;
        ctrlPointer?: number;
        readonly curCtrl?: Controller; // getter
        bindController(
            obj: WebGLOrientedObject,
            init?: {
                offset?: MV.Vector3D;
                scale?:  number;
                speed?:  number;
            }
        );
    }
}

Object.assign(Canvas.prototype, {

    bindController(this: Canvas, 
        obj: WebGLOrientedObject,
        init?: {
            angles?: MV.Vector3D;
            offset?: MV.Vector3D;
            scale?:  number;
            speed?:  number;
        }
    ) {
        // 设置 init 的默认值
        init = Object.assign({
            offset: [0, 0, 0],
            scale: 1.0,
            speed: 1.0
        }, init);

        // 为第一次设置绑定初值，并推送更新逻辑至更新管道
        const isFirstSet = this.controllers ? false : true;
        if (isFirstSet) {
            this.controllers = [];
            this.ctrlPointer = 0;
            Object.defineProperty(this, "curCtrl", {
                get: () => this.controllers[this.ctrlPointer]
            })
            let firstUpdated = false; // 初始化时更新所有托管对象
            this.updatePipeline.push(c => {
                const controllers = firstUpdated ? [c.curCtrl] : c.controllers; 
                for (const ctrl of controllers) {
                    const T = MV.translate(...ctrl.offset);
                    const S = MV.scalem(ctrl.scale, ctrl.scale, ctrl.scale);
                    ctrl.obj.setModelView(MV.mult(T, S, ctrl.R));
                    ctrl.obj.normal    = MV.normalize(MV.transformPoint(ctrl.R, ctrl.obj.initNorm));
                    ctrl.obj.direction = MV.normalize(MV.transformPoint(ctrl.R, ctrl.obj.initDir));
                }
                firstUpdated = true;
            });
        }
        
        // 绑定 obj 至新的 Controller
        const { offset, scale, speed } = init;
        this.controllers.push(new Controller(obj, offset, scale, speed));

        // 若是第一次设置，则添加键盘监听逻辑
        if (isFirstSet) {
            document.onkeydown = event => {
                event = event || window.event || arguments.callee.caller.arguments[0];
                if (!event) {
                    return;
                } else if (event.key in ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
                    if (Number(event.key) <= this.controllers.length) {
                        this.ctrlPointer = Number(event.key) - 1;
                    }
                } else {
                    let ctrl = this.curCtrl;
                    let sgn = 1; // 利用穿透特性设置sgn
                    switch (event.key.toUpperCase()) {
                        case 'E': sgn = -1; 
                        case 'Q': { // 缩放
                            ctrl.scale += sgn * ctrl.speed * 0.05;
                            if (ctrl.scale < 0) {
                                ctrl.scale = 1.0;
                            }
                            break;
                        }
                        case 'S': sgn = -1;
                        case 'W': { // 前进/后退
                            let delta = sgn * ctrl.speed * 0.2;
                            ctrl.offset = <MV.Vector3D>MV.add(
                                ctrl.offset, 
                                MV.scale(delta, ctrl.obj.direction)
                            );
                            break;
                        }
                        case 'A': sgn = -1; 
                        case 'D': { // 沿法线旋转
                            let delta = sgn * ctrl.speed * 0.2;
                            ctrl.R = MV.mult(MV.rotate(delta, ctrl.obj.normal), ctrl.R);
                            //ctrl.obj.direction = MV.transformPoint(R, ctrl.obj.direction);
                            break;
                        }
                        case "ARROWLEFT": sgn = -1; 
                        case 'ARROWRIGHT': { // 沿朝向旋转
                            let delta = sgn * ctrl.speed * 0.05;
                            ctrl.R = MV.mult(MV.rotate(delta, ctrl.obj.direction), ctrl.R);
                            // ctrl.obj.normal = MV.transformPoint(R, ctrl.obj.normal);
                            break;
                        }
                        case "ARROWUP": sgn = -1; 
                        case 'ARROWDOWN': { // 沿法线×朝向旋转
                            let delta = sgn * ctrl.speed * 0.05;
                            ctrl.R = MV.mult(MV.rotate(delta, ctrl.obj.sideAxis), ctrl.R);
                            // ctrl.obj.normal = MV.transformPoint(R, ctrl.obj.normal);
                            // ctrl.obj.direction = MV.transformPoint(R, ctrl.obj.direction);
                            break;
                        }
                    }
                }
            }
        }
    }

});
