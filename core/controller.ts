import * as MV from "./MV.js";
import { Canvas } from "./canvas.js";
import { WebGLOrientedObject, WebGLRenderingObject } from "./webgl-object.js";

export abstract class Controller {
    constructor(
        public obj: WebGLRenderingObject, // 被托管控制的对象
        offset: MV.Vector3D = [0, 0, 0], // 初始物体中心相对于原点的偏移
        scale:  number = 0.0, // 初始等比缩放比例
        rotate: MV.Vector3D = [0, 0, 0], // 三个方向旋转角（先X再Y再Z）
        public speed:  number = 1.0  // 变化速度
    ) {
        this.T = MV.mult(MV.translate(...offset), this.T);
        this.S = MV.mult(MV.scalem(scale, scale, scale), this.S);
        this.R = MV.mult(MV.rotateZ(rotate[2]), MV.rotateY(rotate[1]), MV.rotateX(rotate[0]));
    }

    public T: MV.Matrix = MV.mat4(); // 平移矩阵的累积
    public R: MV.Matrix = MV.mat4(); // 旋转矩阵的累积
    public S: MV.Matrix = MV.mat4(); // 缩放矩阵的累积

    public abstract update(event: KeyboardEvent): void;
}

class DefaultController extends Controller {
    update(event: KeyboardEvent) {
        let sgn = 1; // 利用穿透特性设置sgn
        switch (event.key.toUpperCase()) {
            case 'E': sgn = -1; 
            case 'Q': { // 缩放
                const delta = sgn * this.speed * 0.05;
                this.S = MV.add(MV.scalem(delta, delta, delta), this.S); // 加法保证线性缩放
                if (this.S[0][0] <= 0) {
                    this.S = MV.mat4();
                }
                break;
            }
            case 'ARROWLEFT': sgn = -1; 
            case 'ARROWRIGHT': { // 沿X轴移动
                const delta = sgn * this.speed * 0.2;
                this.T = MV.mult(MV.translate(delta, 0, 0), this.T);
                break;
            }
            case 'ARROWDOWN': sgn = -1;
            case 'ARROWUP': { // 沿Y轴移动
                const delta = sgn * this.speed * 0.2;
                this.T = MV.mult(MV.translate(0, delta, 0), this.T);
                break;
            }
            case 'S': sgn = -1;
            case 'W': { // 沿Z轴移动
                const delta = sgn * this.speed * 0.2;
                this.T = MV.mult(MV.translate(0, 0, delta), this.T);
                break;
            }
            case 'A': sgn = -1; 
            case 'D': { // 沿Y轴旋转
                const delta = sgn * this.speed * 0.05;
                this.R = MV.mult(MV.rotateY(delta), this.R);
                break;
            }
        }
    }
}

class OrientedController extends Controller {

    public obj: WebGLOrientedObject; // 子类中传入的需要是OrientedObject

    update(event: KeyboardEvent) {
        let sgn = 1; // 利用穿透特性设置sgn
        switch (event.key.toUpperCase()) {
            case 'E': sgn = -1; 
            case 'Q': { // 缩放
                const delta = sgn * this.speed * 0.05;
                this.S = MV.add(MV.scalem(delta, delta, delta), this.S); // 加法保证线性缩放
                if (this.S[0][0] <= 0) {
                    this.S = MV.mat4();
                }
                break;
            }
            case 'S': sgn = -1;
            case 'W': { // 前进/后退
                const delta = sgn * this.speed * 0.5;
                this.T = MV.mult(MV.translate(...MV.scale(delta, this.obj.direction)), this.T);
                break;
            }
            case 'D': sgn = -1; 
            case 'A': { // 沿法线旋转
                const delta = sgn * this.speed * 0.2;
                this.R = MV.mult(MV.rotate(delta, this.obj.normal), this.R);
                break;
            }
            case "ARROWLEFT": sgn = -1; 
            case 'ARROWRIGHT': { // 沿朝向旋转
                const delta = sgn * this.speed * 0.05;
                this.R = MV.mult(MV.rotate(delta, this.obj.direction), this.R);
                break;
            }
            case "ARROWUP": sgn = -1; 
            case 'ARROWDOWN': { // 沿法线×朝向旋转
                const delta = sgn * this.speed * 0.05;
                this.R = MV.mult(MV.rotate(delta, this.obj.sideAxis), this.R);
                break;
            }
        }
    }
}

declare module "./canvas.js" {
    interface Canvas {
        controllers?: Array<Controller>;
        ctrlPointer?: number;
        readonly curCtrl?: Controller; // getter
        bindController(
            obj: WebGLRenderingObject | WebGLOrientedObject,
            init?: {
                offset?: MV.Vector3D;
                scale?:  number;
                rotate?: MV.Vector3D;
                speed?:  number;
            }
        ) : Controller;
    }
}

Object.assign(Canvas.prototype, {

    bindController(this: Canvas, 
        obj: WebGLRenderingObject | WebGLOrientedObject,
        init?: {
            angles?: MV.Vector3D;
            offset?: MV.Vector3D;
            scale?:  number;
            rotate?: MV.Vector3D;
            speed?:  number;
        }
    ) {
        // 设置 init 的默认值
        init = Object.assign({
            offset: [0, 0, 0],
            scale: 1.0,
            rotate: [0, 0, 0],
            speed: 1.0
        }, init);

        // 为第一次设置绑定初值、更新逻辑与监听逻辑
        if (!this.controllers) {
            // 初值设置
            this.controllers = [];
            this.ctrlPointer = 0;
            Object.defineProperty(this, "curCtrl", {
                get: () => this.controllers[this.ctrlPointer]
            });

            // 更新逻辑设置
            let firstUpdated = false; // 初始化时更新所有托管对象
            this.updatePipeline.push(c => {
                const controllers = firstUpdated ? [c.curCtrl] : c.controllers; 
                for (const ctrl of controllers) {
                    ctrl.obj.setModel(MV.mult(ctrl.T, ctrl.R, ctrl.S));
                }
                firstUpdated = true;
            });

            // 键盘监听逻辑设置
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
                    ctrl.update(event); // 多态调用对应Controller的更新函数
                }
            }
        }
        
        // 绑定 obj 至新的 Controller
        let controller: Controller;
        const { offset, scale, rotate, speed } = init;
        if (obj instanceof WebGLOrientedObject) {
            controller = new OrientedController(obj, offset, scale, rotate, speed);
        } else { // RenderingObject是基类，要放在最后
            controller = new DefaultController(obj, offset, scale, rotate, speed);
        }
        this.controllers.push(controller);
        return controller;
    }

});
